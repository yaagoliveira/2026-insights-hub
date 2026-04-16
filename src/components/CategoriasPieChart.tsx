import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Despesa, formatCurrency } from "@/data/financeiro2026";

const COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))",
  "hsl(var(--accent))", "hsl(var(--secondary-foreground))", "hsl(var(--muted-foreground))",
  "hsl(var(--primary))",
];

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.04) return null;

  return (
    <text x={x} y={y} fill="hsl(210 20% 95%)" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CategoriasPieChartProps {
  despesas: Despesa[];
}

const CategoriasPieChart = ({ despesas }: CategoriasPieChartProps) => {
  const data = useMemo(() => {
    const pagas = despesas.filter((d) => d.pago);
    const catMap = new Map<string, number>();

    pagas.forEach((d) => catMap.set(d.categoria, (catMap.get(d.categoria) || 0) + d.valor));

    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [despesas]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Gastos por Categoria</h3>
      <p className="text-sm text-muted-foreground mb-4">Distribuição do que já foi pago</p>
      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string) => [
                  <span style={{ color: "hsl(var(--primary))" }}>{formatCurrency(value)}</span>,
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{name}</span>,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-3">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span style={{ color: COLORS[i % COLORS.length] }} className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          Nenhuma despesa paga encontrada com os filtros atuais.
        </div>
      )}
    </div>
  );
};

export default CategoriasPieChart;
