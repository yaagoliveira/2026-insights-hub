import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Despesa, meses, formatCurrency } from "@/data/financeiro2026";

interface EvolucaoChartProps {
  despesas: Despesa[];
}

const EvolucaoChart = ({ despesas }: EvolucaoChartProps) => {
  const data = useMemo(() => {
    let acumulado = 0;

    return meses.map((mes, i) => {
      const mesNum = i + 1;
      const total = despesas.filter((d) => d.mesNum === mesNum).reduce((sum, d) => sum + d.valor, 0);

      acumulado += total;

      return {
        mes: mes.slice(0, 3),
        mensal: Math.round(total * 100) / 100,
        acumulado: Math.round(acumulado * 100) / 100,
      };
    });
  }, [despesas]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Evolução dos Gastos</h3>
      <p className="text-sm text-muted-foreground mb-4">Mensal e acumulado em 2026</p>
      {despesas.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
              formatter={(value: number, name: string) => [formatCurrency(value), name === "mensal" ? "Mensal" : "Acumulado"]}
            />
            <Legend
              formatter={(value) => (value === "mensal" ? "Gasto Mensal" : "Acumulado no Ano")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line type="monotone" dataKey="mensal" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="mensal" />
            <Line type="monotone" dataKey="acumulado" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="acumulado" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          Nenhuma despesa encontrada com os filtros atuais.
        </div>
      )}
    </div>
  );
};

export default EvolucaoChart;
