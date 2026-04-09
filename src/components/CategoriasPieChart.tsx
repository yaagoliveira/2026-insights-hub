import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { despesas, formatCurrency } from "@/data/financeiro2026";

const COLORS = [
  "hsl(160 60% 45%)", "hsl(200 70% 50%)", "hsl(35 90% 55%)",
  "hsl(280 60% 55%)", "hsl(340 65% 55%)", "hsl(160 40% 35%)",
  "hsl(200 50% 40%)", "hsl(35 70% 45%)", "hsl(100 50% 45%)",
  "hsl(220 50% 55%)",
];

const CategoriasPieChart = () => {
  const pagas = despesas.filter((d) => d.pago);
  const catMap = new Map<string, number>();
  pagas.forEach((d) => catMap.set(d.categoria, (catMap.get(d.categoria) || 0) + d.valor));
  const data = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Gastos por Categoria</h3>
      <p className="text-sm text-muted-foreground mb-4">Distribuição do que já foi pago</p>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, color: "hsl(210 20% 92%)" }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center">
          {data.slice(0, 8).map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriasPieChart;
