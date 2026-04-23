// Edge Function: sheets-sync
// Lê as abas "Aquisições" e "Despesas" da planilha Google Sheets configurada
// e retorna os dados normalizados para o dashboard.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
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
  // Remove "R$", espaços, e converte vírgula decimal para ponto
  const cleaned = str
    .replace(/[R$\s]/gi, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove pontos de milhar
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

// ====== Google Service Account JWT (RS256) ======
const pemToArrayBuffer = (pem: string): ArrayBuffer => {
  // Aceita: PEM com quebras reais, PEM com "\n" literais, ou base64 puro sem cabeçalho
  let cleaned = pem.trim();
  // Remove aspas se a chave veio colada com aspas
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");

  if (!cleaned) {
    throw new Error("GOOGLE_SHEETS_PRIVATE_KEY está vazia após sanitização");
  }
  // Garante padding base64 correto
  const pad = cleaned.length % 4;
  if (pad === 2) cleaned += "==";
  else if (pad === 3) cleaned += "=";
  else if (pad === 1) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY tem comprimento base64 inválido");

  let binary: string;
  try {
    binary = atob(cleaned);
  } catch (e) {
    throw new Error(`Falha ao decodificar base64 da chave privada: ${(e as Error).message}`);
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const base64url = (data: ArrayBuffer | string): string => {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else {
    bytes = new Uint8Array(data);
  }
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const getAccessToken = async (
  clientEmail: string,
  privateKeyPem: string,
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Sheets API error [${res.status}] for range "${range}": ${txt}`);
  }
  const data = await res.json();
  return (data.values ?? []) as string[][];
};

// Mapeia cabeçalho normalizado -> índice da coluna
const buildHeaderIndex = (header: string[]): Record<string, number> => {
  const map: Record<string, number> = {};
  header.forEach((h, i) => {
    map[normalize(h)] = i;
  });
  return map;
};

const pick = (row: string[], idx: Record<string, number>, ...keys: string[]) => {
  for (const k of keys) {
    const i = idx[normalize(k)];
    if (i !== undefined && row[i] !== undefined) return row[i];
  }
  return "";
};

interface Compra {
  categoria: string;
  item: string;
  valor: number;
  prazo: string;
  total: number;
  prioridade: string;
}

interface Despesa {
  forma: string;
  categoria: string;
  item: string;
  valor: number;
  mes: string;
  pago: boolean;
  mesNum: number;
}

interface DespesaRecorrente {
  forma: string;
  categoria: string;
  item: string;
  valor: number;
  qntMes: number;
  totalAnual: number;
}

const parseAquisicoes = (rows: string[][]): Compra[] => {
  if (rows.length < 2) return [];
  const headerRow = findHeaderRowSafe(rows, ["Itens"]);
  const idx = buildHeaderIndex(rows[headerRow]);
  return rows.slice(headerRow + 1)
    .filter((r) => r.some((c) => c && c.toString().trim()))
    .map((r) => {
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
      };
    })
    .filter((c) => c.item);
};

const findHeaderRowSafe = (rows: string[][], requiredKeys: string[]): number => {
  const required = requiredKeys.map(normalize);
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const normalized = rows[i].map((c) => normalize(String(c ?? "")));
    if (required.every((k) => normalized.includes(k))) return i;
  }
  return 0;
};

const parseDespesas = (rows: string[][]) => {
  if (rows.length < 2) return { despesas: [] as Despesa[], recorrentes: [] as DespesaRecorrente[] };
  const headerRow = findHeaderRowSafe(rows, ["Itens"]);
  const idx = buildHeaderIndex(rows[headerRow]);
  const despesas: Despesa[] = [];
  const recorrentes: DespesaRecorrente[] = [];

  rows.slice(headerRow + 1)
    .filter((r) => r.some((c) => c && c.toString().trim()))
    .forEach((r) => {
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
          forma: recorrenteFlag,
          categoria,
          item,
          valor,
          qntMes: 12,
          totalAnual: valor * 12,
        });
      } else {
        despesas.push({
          forma: recorrenteFlag || "Único",
          categoria,
          item,
          valor,
          mes: mesRaw,
          pago,
          mesNum: mesNumFromString(mesRaw),
        });
      }
    });

  return { despesas, recorrentes };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientEmailRaw = Deno.env.get("GOOGLE_SHEETS_CLIENT_EMAIL");
    let privateKey = Deno.env.get("GOOGLE_SHEETS_PRIVATE_KEY");
    const sheetId = Deno.env.get("GOOGLE_SHEETS_ID");
    let clientEmail = clientEmailRaw;

    // Se a private key veio como JSON da Service Account, extrai os campos
    if (privateKey && privateKey.trim().startsWith("{")) {
      try {
        const sa = JSON.parse(privateKey);
        if (sa.private_key) privateKey = sa.private_key;
        if (sa.client_email && !clientEmail) clientEmail = sa.client_email;
      } catch (e) {
        throw new Error(`GOOGLE_SHEETS_PRIVATE_KEY parece JSON mas não pôde ser parseado: ${(e as Error).message}`);
      }
    }

    if (!clientEmail) throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL não configurado");
    if (!privateKey) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY não configurado");
    if (!sheetId) throw new Error("GOOGLE_SHEETS_ID não configurado");

    // Diagnóstico (não loga o conteúdo da chave, apenas características)
    console.log("PK diag:", {
      length: privateKey.length,
      startsWith: privateKey.slice(0, 30),
      hasBeginPem: privateKey.includes("BEGIN"),
      hasLiteralBackslashN: privateKey.includes("\\n"),
      hasRealNewline: privateKey.includes("\n"),
    });

    const token = await getAccessToken(clientEmail, privateKey);

    const [aquisicoesRows, despesasRows] = await Promise.all([
      fetchSheet(sheetId, "Aquisições!A1:Z1000", token),
      fetchSheet(sheetId, "Despesas!A1:Z1000", token),
    ]);

    console.log("Despesas header:", JSON.stringify(despesasRows[0] ?? []));
    console.log("Despesas row sample:", JSON.stringify(despesasRows[1] ?? []));
    console.log("Despesas total rows:", despesasRows.length);

    const compras = parseAquisicoes(aquisicoesRows);
    const { despesas, recorrentes } = parseDespesas(despesasRows);

    return new Response(
      JSON.stringify({
        compras,
        despesas,
        recorrentes,
        meta: {
          comprasCount: compras.length,
          despesasCount: despesas.length,
          recorrentesCount: recorrentes.length,
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
