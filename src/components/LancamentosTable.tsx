import { memo, useMemo, useState } from "react";
import { Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/data/financeiro2026";
import { Lancamento } from "@/lib/lancamentos";

interface Props {
  lancamentos: Lancamento[];
}

type Origem = "Todos" | "Caixa" | "Despesas" | "Recorrente";

const LancamentosTable = ({ lancamentos }: Props) => {
  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState<Origem>("Todos");

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lancamentos.filter((l) => {
      if (origem !== "Todos" && l.origem !== origem) return false;
      if (!q) return true;
      return `${l.descricao} ${l.categoria} ${l.mes}`.toLowerCase().includes(q);
    });
  }, [lancamentos, busca, origem]);

  const duplicados = lancamentos.filter((l) => l.duplicado).length;
  const totalEntradas = linhas.filter((l) => !l.duplicado && l.tipo === "Entrada").reduce((s, l) => s + l.valor, 0);
  const totalSaidas = linhas.filter((l) => !l.duplicado && l.tipo === "Saída").reduce((s, l) => s + l.valor, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">🧾 Lançamentos</h3>
          <p className="text-sm text-muted-foreground">
            Caixa + Despesas em um só lugar · {duplicados > 0 ? `${duplicados} lançamento(s) do Caixa já constam em Despesas e não são somados de novo` : "nenhuma duplicidade encontrada"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["Todos", "Caixa", "Despesas", "Recorrente"] as Origem[]).map((o) => (
            <button
              key={o}
              onClick={() => setOrigem(o)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${origem === o ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar lançamento…" className="pl-9" />
        </div>
        <div className="text-xs text-muted-foreground flex gap-4">
          <span>Entradas: <strong className="text-emerald-400">{formatCurrency(totalEntradas)}</strong></span>
          <span>Saídas: <strong className="text-destructive">{formatCurrency(totalSaidas)}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left py-2">Mês</th>
              <th className="text-left py-2">Descrição</th>
              <th className="text-left py-2">Categoria</th>
              <th className="text-left py-2">Origem</th>
              <th className="text-right py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhum lançamento encontrado</td></tr>
            )}
            {linhas.map((l) => (
              <tr key={l.id} className={`border-b border-border/50 ${l.duplicado ? "opacity-50" : ""}`}>
                <td className="py-2 text-muted-foreground">{l.mes}</td>
                <td className="py-2 text-foreground">
                  {l.descricao}
                  {l.duplicado && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400" title={`Já lançado em Despesas: ${l.duplicadoDe}`}>
                      <Copy className="h-3 w-3" /> duplicado
                    </span>
                  )}
                </td>
                <td className="py-2 text-muted-foreground">{l.categoria}</td>
                <td className="py-2"><Badge variant="outline" className="text-xs">{l.origem}</Badge></td>
                <td className={`py-2 text-right font-medium ${l.tipo === "Entrada" ? "text-emerald-400" : "text-foreground"} ${l.duplicado ? "line-through" : ""}`}>
                  {l.tipo === "Entrada" ? "+" : "−"} {formatCurrency(l.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(LancamentosTable);
