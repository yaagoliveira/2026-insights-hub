import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { Compra, Despesa, DespesaRecorrente, formatCurrency } from "@/data/financeiro2026";

interface InsightsPanelProps {
  despesas: Despesa[];
  compras: Compra[];
  recorrentes: DespesaRecorrente[];
}

const InsightsPanel = ({ despesas, compras, recorrentes }: InsightsPanelProps) => {
  const pagas = despesas.filter((d) => d.pago);
  const totalPago = pagas.reduce((s, d) => s + d.valor, 0);
  const mesesPagos = new Set(pagas.map((d) => d.mesNum)).size;
  const mediaMensal = mesesPagos > 0 ? totalPago / mesesPagos : 0;

  const catMap = new Map<string, number>();
  pagas.forEach((d) => catMap.set(d.categoria, (catMap.get(d.categoria) || 0) + d.valor));
  const topCat = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;

  const totalCompras = compras.reduce((s, c) => s + c.total, 0);
  const comprasPrioritarias = compras.filter((c) => c.prioridade === "Sim").reduce((s, c) => s + c.total, 0);
  const comprasPrioritariasCount = compras.filter((c) => c.prioridade === "Sim").length;

  const recorrenteMensal = recorrentes.reduce((s, r) => s + r.valor, 0);

  const insights = [
    {
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Média mensal de gastos",
      desc:
        mesesPagos > 0
          ? `Nos ${mesesPagos} meses pagos em foco, sua média foi de ${formatCurrency(mediaMensal)}/mês.`
          : "Nenhuma despesa paga encontrada no recorte atual.",
    },
    {
      icon: AlertTriangle,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      title: "Maior categoria de gasto",
      desc: topCat
        ? `"${topCat[0]}" já consumiu ${formatCurrency(topCat[1])} — ${((topCat[1] / totalPago) * 100).toFixed(1)}% do total pago.`
        : "Ainda não há uma categoria dominante entre os pagamentos filtrados.",
    },
    {
      icon: TrendingDown,
      color: "text-accent",
      bg: "bg-accent/10",
      title: "Despesas recorrentes",
      desc:
        recorrentes.length > 0
          ? `Você tem ${formatCurrency(recorrenteMensal)}/mês em contas fixas (${formatCurrency(recorrenteMensal * 12)}/ano).`
          : "Nenhuma despesa recorrente encontrada para os filtros atuais.",
    },
    {
      icon: Lightbulb,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
      title: "Aquisições prioritárias",
      desc:
        comprasPrioritariasCount > 0
          ? `${formatCurrency(comprasPrioritarias)} em ${comprasPrioritariasCount} aquisições marcadas como prioridade alta. Total em foco: ${formatCurrency(totalCompras)}.`
          : `Nenhuma aquisição está marcada como prioridade alta. Total em foco: ${formatCurrency(totalCompras)}.`,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">💡 Insights & Alertas</h3>
      <div className="grid gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className={`p-2 rounded-lg ${ins.bg}`}>
              <ins.icon className={`h-4 w-4 ${ins.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{ins.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ins.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
