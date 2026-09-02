import { Despesa, DespesaRecorrente, MovimentoCaixa, meses } from "@/data/financeiro2026";

export type OrigemLancamento = "Caixa" | "Despesas" | "Recorrente";

export interface Lancamento {
  id: string;
  data: string;
  mesNum: number;
  mes: string;
  categoria: string;
  descricao: string;
  valor: number;
  tipo: "Entrada" | "Saída";
  origem: OrigemLancamento;
  pago: boolean;
  /** Lançamento do Caixa que já existe na aba Despesas — não entra nos totais. */
  duplicado: boolean;
  duplicadoDe?: string;
}

const norm = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const INVESTIMENTO_KEYS = [
  "invest", "poupan", "caixinha", "aplica", "reserva", "cdb", "tesouro", "renda fixa", "fundo",
];

export const isInvestimento = (m: { categoria?: string; descricao?: string }) => {
  const v = `${norm(m.categoria ?? "")} ${norm(m.descricao ?? "")}`;
  return INVESTIMENTO_KEYS.some((k) => v.includes(k));
};

const mesNome = (mesNum: number) => (mesNum >= 1 && mesNum <= 12 ? meses[mesNum - 1] : "—");

/**
 * Constrói o livro de lançamentos unificado (Caixa + Despesas + Recorrentes),
 * marcando como duplicados os movimentos de saída do Caixa que já foram
 * registrados na aba Despesas (mesmo mês e mesmo valor, ou descrição igual).
 */
export const buildLancamentos = (
  caixa: MovimentoCaixa[],
  despesas: Despesa[],
  recorrentes: DespesaRecorrente[],
): Lancamento[] => {
  const lancamentos: Lancamento[] = [];

  despesas.forEach((d, i) => {
    lancamentos.push({
      id: `desp-${i}`,
      data: d.mes,
      mesNum: d.mesNum,
      mes: mesNome(d.mesNum) || d.mes,
      categoria: d.categoria || "Outros",
      descricao: d.item,
      valor: d.valor,
      tipo: "Saída",
      origem: "Despesas",
      pago: Boolean(d.pago),
      duplicado: false,
    });
  });

  recorrentes.forEach((r, i) => {
    for (let m = 1; m <= (r.qntMes || 12); m++) {
      lancamentos.push({
        id: `rec-${i}-${m}`,
        data: mesNome(m),
        mesNum: m,
        mes: mesNome(m),
        categoria: r.categoria || "Outros",
        descricao: `${r.item} (recorrente)`,
        valor: r.valor,
        tipo: "Saída",
        origem: "Recorrente",
        pago: false,
        duplicado: false,
      });
    }
  });

  // índice de despesas por mês + valor arredondado para detectar duplicidade
  const chave = (mesNum: number, valor: number) => `${mesNum}|${valor.toFixed(2)}`;
  const indiceDespesas = new Map<string, string>();
  despesas.forEach((d) => {
    indiceDespesas.set(chave(d.mesNum, d.valor), d.item);
    indiceDespesas.set(`${d.mesNum}|${norm(d.item)}`, d.item);
  });

  caixa.forEach((m, i) => {
    const investimento = isInvestimento(m);
    const dup =
      m.tipo === "Saída" &&
      !investimento &&
      (indiceDespesas.get(chave(m.mesNum, m.valor)) ??
        indiceDespesas.get(`${m.mesNum}|${norm(m.descricao)}`));
    lancamentos.push({
      id: `caixa-${i}`,
      data: m.data,
      mesNum: m.mesNum,
      mes: mesNome(m.mesNum),
      categoria: m.categoria || (investimento ? "Investimento" : "Outros"),
      descricao: m.descricao || m.categoria,
      valor: m.valor,
      tipo: m.tipo,
      origem: "Caixa",
      pago: true,
      duplicado: Boolean(dup),
      duplicadoDe: dup || undefined,
    });
  });

  return lancamentos.sort((a, b) => a.mesNum - b.mesNum || a.descricao.localeCompare(b.descricao, "pt-BR"));
};

export interface ResumoMes {
  mesNum: number;
  mes: string;
  entradas: number;
  saidas: number;
  investido: number;
  pago: number;
  liquido: number;
  acumulado: number;
  disponivel: number;
}

/** Resumo mensal a partir dos lançamentos válidos (sem duplicidades). */
export const resumirPorMes = (lancamentos: Lancamento[]): ResumoMes[] => {
  const base = meses.map((mes, i) => ({
    mesNum: i + 1,
    mes,
    entradas: 0,
    saidas: 0,
    investido: 0,
    pago: 0,
    liquido: 0,
    acumulado: 0,
    disponivel: 0,
  }));

  for (const l of lancamentos) {
    if (l.duplicado || l.mesNum < 1 || l.mesNum > 12) continue;
    const row = base[l.mesNum - 1];
    if (l.tipo === "Entrada") {
      row.entradas += l.valor;
      continue;
    }
    row.saidas += l.valor;
    if (isInvestimento(l)) row.investido += l.valor;
    if (l.pago) row.pago += l.valor;
  }

  let acumulado = 0;
  for (const row of base) {
    row.liquido = row.entradas - row.saidas;
    acumulado += row.liquido;
    row.acumulado = acumulado;
    row.disponivel = row.entradas - row.pago;
  }

  return base;
};
