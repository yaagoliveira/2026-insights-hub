import { memo, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Despesa, DespesaRecorrente, MovimentoCaixa, formatCurrency, meses } from "@/data/financeiro2026";

interface Props {
  caixa: MovimentoCaixa[];
  despesas: Despesa[];
  recorrentes: DespesaRecorrente[];
  mesFiltro: number | null;
}

const FluxoCaixaPanel = ({ caixa, despesas, recorrentes, mesFiltro }: Props) => {
  const byMonth = useMemo(() => {
    let acumulado = 0;
    const recorrenteMensal = recorrentes.reduce((s, r) => s + r.valor, 0);
    return meses.map((mes, i) => {
      const mesNum = i + 1;
      const entradas = caixa
        .filter((m) => m.mesNum === mesNum && m.tipo === "Entrada")
        .reduce((s, m) => s + m.valor, 0);
      const saidasCaixa = caixa
        .filter((m) => m.mesNum === mesNum && m.tipo === "Saída")
        .reduce((s, m) => s + m.valor, 0);
      const despMes = despesas
        .filter((d) => d.mesNum === mesNum)
        .reduce((s, d) => s + d.valor, 0);
      const saidas = saidasCaixa + despMes + recorrenteMensal;
      const liquido = entradas - saidas;
      acumulado += liquido;
      return {
        mes: mes.slice(0, 3),
        mesNum,
        entradas: Math.round(entradas * 100) / 100,
        saidas: Math.round(saidas * 100) / 100,
        liquido: Math.round(liquido * 100) / 100,
        acumulado: Math.round(acumulado * 100) / 100,
      };
    });
  }, [caixa, despesas, recorrentes]);

  const totais = useMemo(() => {
    const rows = mesFiltro ? byMonth.filter((r) => r.mesNum === mesFiltro) : byMonth;
    const entradas = rows.reduce((s, r) => s + r.entradas, 0);
    const saidas = rows.reduce((s, r) => s + r.saidas, 0);
    return { entradas, saidas, liquido: entradas - saidas };
  }, [byMonth, mesFiltro]);

  const liquidoColor = totais.liquido >= 0 ? "text-emerald-400" : "text-destructive";
  const liquidoBg = totais.liquido >= 0 ? "bg-emerald-500/10" : "bg-destructive/10";

  if (caixa.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Fluxo de Caixa</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crie a aba <code className="text-xs bg-muted px-1 py-0.5 rounded">Caixa</code> na planilha com as colunas{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">Data | Categoria | Descrição | Valor | Tipo</code>{" "}
              (Tipo = Entrada/Saída) e atualize para acompanhar o valor líquido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">💵 Fluxo de Caixa</h3>
        <p className="text-sm text-muted-foreground">Entradas vs. saídas (despesas + recorrentes + saídas avulsas)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-3 flex items-center gap-3">
          <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totais.entradas)}</p>
          </div>
        </div>
        <div className="rounded-lg bg-destructive/10 p-3 flex items-center gap-3">
          <ArrowDownCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totais.saidas)}</p>
          </div>
        </div>
        <div className={`rounded-lg ${liquidoBg} p-3 flex items-center gap-3`}>
          {totais.liquido >= 0
            ? <TrendingUp className={`h-5 w-5 ${liquidoColor}`} />
            : <TrendingDown className={`h-5 w-5 ${liquidoColor}`} />}
          <div>
            <p className="text-xs text-muted-foreground">Líquido</p>
            <p className={`text-lg font-semibold ${liquidoColor}`}>{formatCurrency(totais.liquido)}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={byMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            formatter={(v: number, n: string) => [formatCurrency(v), n === "entradas" ? "Entradas" : n === "saidas" ? "Saídas" : "Acumulado"]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === "entradas" ? "Entradas" : v === "saidas" ? "Saídas" : "Saldo Acumulado"} />
          <Bar dataKey="entradas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saidas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="acumulado" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(FluxoCaixaPanel);
