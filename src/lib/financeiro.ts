import { Compra, Despesa, DespesaRecorrente, meses } from "@/data/financeiro2026";

export type IndexedItem<T> = T & { originalIndex: number };

const MES_REFERENCIA_COMPRAS = 4;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const mesesNormalizados = meses.map((mes) => normalizeText(mes));

const getCompraMesNum = (prazo: string): number | "recorrente" | null => {
  const prazoNormalizado = normalizeText(prazo);
  const mesIndex = mesesNormalizados.findIndex((mes) => prazoNormalizado.includes(mes));

  if (mesIndex >= 0) return mesIndex + 1;
  if (prazoNormalizado.includes("mensal")) return "recorrente";
  if (prazoNormalizado.includes("60 dias")) return Math.min(MES_REFERENCIA_COMPRAS + 2, 12);

  return null;
};

export const withOriginalIndex = <T extends object>(items: T[]): IndexedItem<T>[] =>
  items.map((item, originalIndex) => ({ ...item, originalIndex }));

export const filterDespesas = <T extends Despesa>(
  despesas: T[],
  mesFiltro: number | null,
  categoriaFiltro: string | null,
) =>
  despesas.filter((despesa) => {
    if (mesFiltro !== null && despesa.mesNum !== mesFiltro) return false;
    if (categoriaFiltro && despesa.categoria !== categoriaFiltro) return false;

    return true;
  });

export const filterCompras = <T extends Compra>(
  compras: T[],
  mesFiltro: number | null,
  categoriaFiltro: string | null,
) =>
  compras.filter((compra) => {
    if (categoriaFiltro && compra.categoria !== categoriaFiltro) return false;
    if (mesFiltro === null) return true;

    const prazoMes = getCompraMesNum(compra.prazo);

    if (prazoMes === "recorrente") return true;

    return prazoMes === mesFiltro;
  });

export const filterRecorrentes = <T extends DespesaRecorrente>(recorrentes: T[], categoriaFiltro: string | null) =>
  recorrentes.filter((recorrente) => {
    if (categoriaFiltro && recorrente.categoria !== categoriaFiltro) return false;

    return true;
  });

export const collectCategorias = (...groups: Array<Array<{ categoria: string }>>) =>
  Array.from(
    new Set(
      groups.flatMap((group) =>
        group
          .map((item) => item.categoria?.trim())
          .filter((categoria): categoria is string => Boolean(categoria)),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));