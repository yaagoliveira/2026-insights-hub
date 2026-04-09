import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { despesas, meses, formatCurrency } from "@/data/financeiro2026";

const DespesasMensaisChart = () => {
  const data = meses.map((mes, i) => {
    const total = despesas
      .filter((d) => d.mesNum === i + 1)
      .reduce((sum, d) => sum + d.valor, 0);
    const pago = despesas
      .filter((d) => d.mesNum === i + 1 && d.pago)
      .reduce((sum, d) => sum + d.valor, 0);
    return { mes: mes.slice(0, 3), total: Math.round(total * 100) / 100, pago, pendente: Math.round((total - pago) * 100) / 100 };
  });

  const mesAtual = 4;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Despesas por Mês</h3>
      <p className="text-sm text-muted-foreground mb-4">Evolução mensal dos gastos em 2026</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis dataKey="mes" stroke="hsl(215 15% 55%)" fontSize={12} />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, color: "hsl(210 20% 92%)" }}
            formatter={(value: number) => [formatCurrency(value), ""]}
          />
          <Legend
            formatter={(value) => (value === "total" ? "Total" : value)}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Total">
            {data.map((_, index) => (
              <Cell key={index} fill={index < mesAtual ? "hsl(160 60% 45%)" : "hsl(220 15% 25%)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "hsl(160 60% 45%)" }} />
          <span>Meses passados</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: "hsl(220 15% 25%)" }} />
          <span>Meses futuros</span>
        </div>
      </div>
    </div>
  );
};

export default DespesasMensaisChart;
