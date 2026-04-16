import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Despesa, meses, formatCurrency } from "@/data/financeiro2026";

interface DespesasMensaisChartProps {
  despesas: Despesa[];
}

const DespesasMensaisChart = ({ despesas }: DespesasMensaisChartProps) => {
  const data = useMemo(
    () =>
      meses.map((mes, i) => {
        const total = despesas.filter((d) => d.mesNum === i + 1).reduce((sum, d) => sum + d.valor, 0);
        const pago = despesas.filter((d) => d.mesNum === i + 1 && d.pago).reduce((sum, d) => sum + d.valor, 0);

        return {
          mes: mes.slice(0, 3),
          total: Math.round(total * 100) / 100,
          pago,
          pendente: Math.round((total - pago) * 100) / 100,
        };
      }),
    [despesas],
  );

  const mesAtual = 4;
  const hasData = despesas.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Despesas por Mês</h3>
      <p className="text-sm text-muted-foreground mb-4">Evolução mensal dos gastos em 2026</p>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
              <Legend formatter={(value) => (value === "total" ? "Total" : value)} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Total">
                {data.map((_, index) => (
                  <Cell key={index} fill={index < mesAtual ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: "hsl(var(--primary))" }} />
              <span>Meses passados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: "hsl(var(--muted))" }} />
              <span>Meses futuros</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          Nenhuma despesa encontrada com os filtros atuais.
        </div>
      )}
    </div>
  );
};

export default DespesasMensaisChart;
