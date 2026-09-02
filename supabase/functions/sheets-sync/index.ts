// Edge Function: sheets-sync
// GET: lê abas "Aquisições", "Despesas" e "Caixa" da planilha
// POST: grava de volta alterações (Pago, Comprado, Prioridade)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const meses = [
  "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const normalize = (s: string) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const parseNumber = (raw: unknown): number => {
  if (raw === null || raw === undefined) return 0;
  const str = raw.toString().trim();
  if (!str) return 0;
  const cleaned = str
    .replace(/[R$\s]/gi, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,/g, ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const parseBool = (raw: unknown): boolean => {
  const v = normalize(String(raw ?? ""));
  return ["sim", "true", "1", "x", "pago", "ok"].includes(v);
};

const mesNumFromString = (raw: string): number => {
  const v = normalize(raw);
  const idx = meses.findIndex((m) => v.includes(m));
  return idx >= 0 ? idx + 1 : 0;
};

const mesNumFromDate = (raw: string): number => {
  const s = (raw ?? "").toString().trim();
  if (!s) return 0;
  // dd/mm/yyyy ou dd-mm-yyyy
  const m1 = s.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?/);
  if (m1) {
    const mm = parseInt(m1[2], 10);
    if (mm >= 1 && mm <= 12) return mm;
  }
  // yyyy-mm-dd
  const m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m2) {
    const mm = parseInt(m2[2], 10);
    if (mm >= 1 && mm <= 12) return mm;
  }
  return mesNumFromString(s);
};

// ====== Google Service Account JWT (RS256) ======
const pemToArrayBuffer = (pem: string): ArrayBuffer => {
  let cleaned = pem.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");

  if (!cleaned) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY vazia");
  const pad = cleaned.length % 4;
  if (pad === 2) cleaned += "==";
  else if (pad === 3) cleaned += "=";
  else if (pad === 1) throw new Error("chave base64 inválida");

  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const base64url = (data: ArrayBuffer | string): string => {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const getAccessToken = async (
  clientEmail: string,
  privateKeyPem: string,
  scope: string,
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const toSign = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(toSign),
  );
  const jwt = `${toSign}.${base64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OAuth token error [${res.status}]: ${txt}`);
  }
  const json = await res.json();
  return json.access_token as string;
};

const fetchSheet = async (
  spreadsheetId: string,
  range: string,
  token: string,
): Promise<string[][]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 400 || res.status === 404) {
      console.warn(`Sheet ausente p/ range "${range}": ${txt}`);
      return [];
    }
    throw new Error(`Sheets API error [${res.status}] for range "${range}": ${txt}`);
  }
  const data = await res.json();
  return (data.values ?? []) as string[][];
};

const colNumberToLetter = (n: number): string => {
  let s = "";
  let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
};

const writeCell = async (
  spreadsheetId: string,
  sheetName: string,
  cell: string,
  value: string,
  token: string,
) => {
  const range = `${sheetName}!${cell}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ range, majorDimension: "ROWS", values: [[value]] }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Sheets write error [${res.status}]: ${txt}`);
  }
};

const buildHeaderIndex = (header: string[]): Record<string, number> => {
  const map: Record<string, number> = {};
  header.forEach((h, i) => { map[normalize(h)] = i; });
  return map;
};

const pick = (row: string[], idx: Record<string, number>, ...keys: string[]) => {
  for (const k of keys) {
    const i = idx[normalize(k)];
    if (i !== undefined && row[i] !== undefined) return row[i];
  }
  return "";
};

const findHeaderRowSafe = (rows: string[][], requiredKeys: string[]): number => {
  const required = requiredKeys.map(normalize);
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const normalized = rows[i].map((c) => normalize(String(c ?? "")));
    if (required.every((k) => normalized.includes(k))) return i;
  }
  return 0;
};

const parseAquisicoes = (rows: string[][]) => {
  if (rows.length < 2) return { items: [] as any[], headerRow: 0, idx: {} as Record<string, number> };
  const headerRow = findHeaderRowSafe(rows, ["Itens"]);
  const idx = buildHeaderIndex(rows[headerRow]);
  const items = rows.slice(headerRow + 1)
    .map((r, i) => ({ r, rowNumber: headerRow + 2 + i }))
    .filter(({ r }) => r.some((c) => c && c.toString().trim()))
    .map(({ r, rowNumber }) => {
      const valor = parseNumber(pick(r, idx, "Valor"));
      const totalRaw = pick(r, idx, "Total");
      const total = totalRaw ? parseNumber(totalRaw) : valor;
      return {
        categoria: pick(r, idx, "Categoria").toString().trim(),
        item: pick(r, idx, "Itens", "Item").toString().trim(),
        valor,
        prazo: pick(r, idx, "Prazo").toString().trim(),
        total,
        prioridade: pick(r, idx, "Prioridade").toString().trim() || "Padrão",
        comprado: parseBool(pick(r, idx, "Comprado", "Adquirido", "Status")),
        rowNumber,
      };
    })
    .filter((c) => c.item);
  return { items, headerRow, idx };
};

const parseDespesas = (rows: string[][]) => {
  if (rows.length < 2) return { despesas: [] as any[], recorrentes: [] as any[], headerRow: 0, idx: {} as Record<string, number> };
  const headerRow = findHeaderRowSafe(rows, ["Itens"]);
  const idx = buildHeaderIndex(rows[headerRow]);
  const despesas: any[] = [];
  const recorrentes: any[] = [];

  rows.slice(headerRow + 1).forEach((r, i) => {
    const rowNumber = headerRow + 2 + i;
    if (!r.some((c) => c && c.toString().trim())) return;
    const recorrenteFlag = normalize(pick(r, idx, "Recorrente"));
    const categoria = pick(r, idx, "Categoria").toString().trim();
    const item = pick(r, idx, "Itens", "Item").toString().trim();
    const valor = parseNumber(pick(r, idx, "Valor"));
    const mesRaw = pick(r, idx, "Mês Cobrança", "Mes Cobranca", "Cobrança", "Cobranca", "Mês", "Mes").toString().trim();
    const pago = parseBool(pick(r, idx, "Pago"));
    if (!item) return;

    const isRecorrente = ["sim", "true", "1", "x", "mensal"].includes(recorrenteFlag);
    if (isRecorrente) {
      recorrentes.push({
        forma: recorrenteFlag, categoria, item, valor,
        qntMes: 12, totalAnual: valor * 12,
      });
    } else {
      despesas.push({
        forma: recorrenteFlag || "Único",
        categoria, item, valor, mes: mesRaw, pago,
        mesNum: mesNumFromString(mesRaw),
        rowNumber,
      });
    }
  });

  return { despesas, recorrentes, headerRow, idx };
};

const parseCaixa = (rows: string[][]) => {
  if (rows.length < 2) return [] as any[];
  const headerRow = findHeaderRowSafe(rows, ["Valor"]);
  const idx = buildHeaderIndex(rows[headerRow]);
  return rows.slice(headerRow + 1)
    .filter((r) => r.some((c) => c && c.toString().trim()))
    .map((r) => {
      const dataRaw = pick(r, idx, "Data", "Dados").toString().trim();
      const valor = parseNumber(pick(r, idx, "Valor"));
      const tipoRaw = normalize(pick(r, idx, "Tipo"));
      const tipo = tipoRaw.startsWith("sa") ? "Saída" : "Entrada";
      return {
        data: dataRaw,
        categoria: pick(r, idx, "Categoria").toString().trim(),
        descricao: pick(r, idx, "Descrição", "Descricao", "Description").toString().trim(),
        valor,
        tipo,
        mesNum: mesNumFromDate(dataRaw),
      };
    })
    .filter((m) => m.valor > 0);
};

const getCreds = () => {
  const clientEmailRaw = Deno.env.get("GOOGLE_SHEETS_CLIENT_EMAIL");
  let privateKey = Deno.env.get("GOOGLE_SHEETS_PRIVATE_KEY");
  const sheetId = Deno.env.get("GOOGLE_SHEETS_ID");
  let clientEmail = clientEmailRaw;
  if (privateKey && privateKey.trim().startsWith("{")) {
    const sa = JSON.parse(privateKey);
    if (sa.private_key) privateKey = sa.private_key;
    if (sa.client_email && !clientEmail) clientEmail = sa.client_email;
  }
  if (!clientEmail) throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL não configurado");
  if (!privateKey) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY não configurado");
  if (!sheetId) throw new Error("GOOGLE_SHEETS_ID não configurado");
  return { clientEmail, privateKey, sheetId };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, privateKey, sheetId } = getCreds();

    if (req.method === "POST") {
      const body = await req.json();
      const { sheet, rowNumber, column, value } = body as {
        sheet: string; rowNumber: number; column: string; value: string;
      };
      if (!sheet || !rowNumber || !column) {
        return new Response(JSON.stringify({ error: "sheet, rowNumber e column são obrigatórios" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
        });
      }
      const token = await getAccessToken(clientEmail, privateKey, "https://www.googleapis.com/auth/spreadsheets");
      // Buscar cabeçalho da aba alvo para descobrir coluna
      const headerRows = await fetchSheet(sheetId, `${sheet}!A1:Z10`, token);
      const headerRowIdx = findHeaderRowSafe(headerRows, [column]);
      const headerArr = headerRows[headerRowIdx] ?? [];
      const colIdx = headerArr.findIndex((h) => normalize(h) === normalize(column));
      if (colIdx < 0) {
        return new Response(JSON.stringify({ error: `Coluna "${column}" não encontrada em "${sheet}"` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404,
        });
      }
      const cell = `${colNumberToLetter(colIdx + 1)}${rowNumber}`;
      await writeCell(sheetId, sheet, cell, value ?? "", token);
      return new Response(JSON.stringify({ ok: true, cell }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    // GET — leitura
    const token = await getAccessToken(clientEmail, privateKey, "https://www.googleapis.com/auth/spreadsheets.readonly");

    const [aquisicoesRows, despesasRows, caixaRows] = await Promise.all([
      fetchSheet(sheetId, "Aquisições!A1:Z1000", token),
      fetchSheet(sheetId, "Despesas!A1:Z1000", token),
      fetchSheet(sheetId, "Caixa!A1:Z1000", token),
    ]);

    const { items: compras } = parseAquisicoes(aquisicoesRows);
    const { despesas, recorrentes } = parseDespesas(despesasRows);
    const caixa = parseCaixa(caixaRows);

    return new Response(
      JSON.stringify({
        compras,
        despesas,
        recorrentes,
        caixa,
        meta: {
          comprasCount: compras.length,
          despesasCount: despesas.length,
          recorrentesCount: recorrentes.length,
          caixaCount: caixa.length,
          fetchedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("sheets-sync error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
