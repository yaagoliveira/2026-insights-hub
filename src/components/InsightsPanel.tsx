import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { despesas, compras, despesasRecorrentes, formatCurrency } from "@/data/financeiro2026";

const InsightsPanel = () => {
  const pagas = despesas.filter((d) => d.pago);
  const totalPago = pagas.reduce((s, d) => s + d.valor, 0);
  const mesesPagos = new Set(pagas.map((d) => d.mesNum)).size;
  const mediaMensal = totalPago / mesesPagos;

  const catMap = new Map<string, number>();
  pagas.forEach((d) => catMap.set(d.categoria, (catMap.get(d.categoria) || 0) + d.valor));
  const topCat = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];

  const totalCompras = compras.reduce((s, c) => s + c.total, 0);
  const comprasPrioritarias = compras.filter((c) => c.prioridade === "Sim").reduce((s, c) => s + c.total, 0);

  const recorrenteMensal = despesasRecorrentes.reduce((s, r) => s + r.valor, 0);

  const insights = [
    {
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Média mensal de gastos",
      desc: `Nos últimos ${mesesPagos} meses, sua média foi de ${formatCurrency(mediaMensal)}/mês.`,
    },
    {
      icon: AlertTriangle,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      title: "Maior categoria de gasto",
      desc: `"${topCat[0]}" já consumiu ${formatCurrency(topCat[1])} — ${((topCat[1] / totalPago) * 100).toFixed(1)}% do total pago.`,
    },
    {
      icon: TrendingDown,
      color: "text-accent",
      bg: "bg-accent/10",
      title: "Despesas recorrentes",
      desc: `Você tem ${formatCurrency(recorrenteMensal)}/mês em contas fixas (${formatCurrency(recorrenteMensal * 12)}/ano).`,
    },
    {
      icon: Lightbulb,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
      title: "Compras prioritárias pendentes",
      desc: `${formatCurrency(comprasPrioritarias)} em compras de alta prioridade. Total planejado: ${formatCurrency(totalCompras)}.`,
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
