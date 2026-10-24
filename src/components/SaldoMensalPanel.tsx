import { memo, useMemo } from "react";
import { PiggyBank, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/data/financeiro2026";
import { ResumoMes } from "@/lib/lancamentos";

interface Props {
  resumo: ResumoMes[];
  mesFiltro: number | null;
}

const SaldoMensalPanel = ({ resumo, mesFiltro }: Props) => {
  const mesAtual = new Date().getMonth() + 1;
  const mesRef = mesFiltro ?? mesAtual;
  const atual = resumo[mesRef - 1];

  const totalInvestido = useMemo(() => resumo.reduce((s, r) => s + r.investido, 0), [resumo]);
  const mesesVisiveis = useMemo(() => resumo.filter((r) => r.entradas > 0 || r.saidas > 0), [resumo]);

  if (!atual) return null;
  const positivo = atual.liquido >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">📊 Saldo Mensal — {atual.mes}</h3>
        <p className="text-sm text-muted-foreground">Atualizado automaticamente com Caixa e Despesas (sem duplicidades)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`rounded-lg p-4 ${positivo ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {positivo ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
            Valor líquido do mês
          </div>
          <p className={`text-2xl font-bold mt-1 ${positivo ? "text-emerald-400" : "text-destructive"}`}>{formatCurrency(atual.liquido)}</p>
          <p className="text-xs text-muted-foreground mt-1">Entradas {formatCurrency(atual.entradas)} − Saídas {formatCurrency(atual.saidas)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> Falta do salário
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(atual.disponivel)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {atual.entradas > 0 ? `${Math.max(0, (atual.disponivel / atual.entradas) * 100).toFixed(0)}% ainda disponível · já pago ${formatCurrency(atual.pago)}` : "Sem salário lançado no mês"}
          </p>
        </div>
        <div className="rounded-lg bg-primary/10 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PiggyBank className="h-4 w-4 text-primary" /> Já investido
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(atual.investido)}</p>
          <p className="text-xs text-muted-foreground mt-1">No ano: {formatCurrency(totalInvestido)}</p>
        </div>
      </div>

      {mesesVisiveis.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-2">Mês</th>
                <th className="text-right py-2">Entradas</th>
                <th className="text-right py-2">Saídas</th>
                <th className="text-right py-2">Investido</th>
                <th className="text-right py-2">Falta do salário</th>
                <th className="text-right py-2">Líquido</th>
                <th className="text-right py-2">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {mesesVisiveis.map((r) => (
                <tr key={r.mesNum} className={`border-b border-border/50 ${r.mesNum === mesRef ? "bg-muted/40" : ""}`}>
                  <td className="py-2 text-foreground">{r.mes}</td>
                  <td className="py-2 text-right text-foreground">{formatCurrency(r.entradas)}</td>
                  <td className="py-2 text-right text-foreground">{formatCurrency(r.saidas)}</td>
                  <td className="py-2 text-right text-foreground">{formatCurrency(r.investido)}</td>
                  <td className="py-2 text-right text-foreground">{formatCurrency(r.disponivel)}</td>
                  <td className={`py-2 text-right font-medium ${r.liquido >= 0 ? "text-emerald-400" : "text-destructive"}`}>{formatCurrency(r.liquido)}</td>
                  <td className={`py-2 text-right ${r.acumulado >= 0 ? "text-emerald-400" : "text-destructive"}`}>{formatCurrency(r.acumulado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(SaldoMensalPanel);
