import { despesasRecorrentes, formatCurrency } from "@/data/financeiro2026";
import { RotateCcw } from "lucide-react";

const RecorrentesCard = () => {
  const totalMensal = despesasRecorrentes.reduce((s, r) => s + r.valor, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Despesas Recorrentes</h3>
      </div>
      <div className="space-y-3">
        {despesasRecorrentes.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium text-foreground">{r.item}</p>
              <p className="text-xs text-muted-foreground">{r.categoria} · {r.forma}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatCurrency(r.valor)}/mês</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(r.totalAnual)}/ano</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex justify-between">
        <span className="text-sm text-muted-foreground">Total mensal fixo</span>
        <span className="text-sm font-bold text-primary">{formatCurrency(totalMensal)}</span>
      </div>
    </div>
  );
};

export default RecorrentesCard;
