import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { despesas, meses, formatCurrency } from "@/data/financeiro2026";

interface EvolucaoChartProps {
  mesFiltro: number | null;
  categoriaFiltro: string | null;
}

const EvolucaoChart = ({ mesFiltro, categoriaFiltro }: EvolucaoChartProps) => {
  const filtered = despesas.filter((d) => {
    if (categoriaFiltro && d.categoria !== categoriaFiltro) return false;
    return true;
  });

  let acumulado = 0;
  const data = meses.map((mes, i) => {
    const mesNum = i + 1;
    const total = filtered
      .filter((d) => d.mesNum === mesNum)
      .reduce((sum, d) => sum + d.valor, 0);
    acumulado += total;
    return {
      mes: mes.slice(0, 3),
      mensal: Math.round(total * 100) / 100,
      acumulado: Math.round(acumulado * 100) / 100,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Evolução dos Gastos</h3>
      <p className="text-sm text-muted-foreground mb-4">Mensal e acumulado em 2026</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis dataKey="mes" stroke="hsl(215 15% 55%)" fontSize={12} />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, color: "hsl(210 20% 92%)" }}
            formatter={(value: number, name: string) => [formatCurrency(value), name === "mensal" ? "Mensal" : "Acumulado"]}
          />
          <Legend formatter={(value) => (value === "mensal" ? "Mensal" : "Acumulado")} />
          <Line type="monotone" dataKey="mensal" stroke="hsl(200 70% 50%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="acumulado" stroke="hsl(160 60% 45%)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolucaoChart;
