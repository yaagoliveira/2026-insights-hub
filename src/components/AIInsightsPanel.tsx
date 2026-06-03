import { useState } from "react";
import { Sparkles, AlertTriangle, PiggyBank, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Compra, Despesa, DespesaRecorrente, MovimentoCaixa } from "@/data/financeiro2026";

interface Insights {
  resumo: string;
  alertas: string[];
  oportunidadesEconomia: string[];
  sugestoesInvestimento: string[];
  proximoPasso: string;
}

interface Props {
  despesas: Despesa[];
  compras: Compra[];
  recorrentes: DespesaRecorrente[];
  caixa: MovimentoCaixa[];
}

const buildSummary = ({ despesas, compras, recorrentes, caixa }: Props) => {
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const totalPago = despesas.filter((d) => d.pago).reduce((s, d) => s + d.valor, 0);
  const totalEntradas = caixa.filter((c) => c.tipo === "Entrada").reduce((s, c) => s + c.valor, 0);
  const totalSaidasCaixa = caixa.filter((c) => c.tipo === "Saída").reduce((s, c) => s + c.valor, 0);
  const recorrenteAnual = recorrentes.reduce((s, r) => s + r.totalAnual, 0);

  const porCategoria: Record<string, number> = {};
  despesas.forEach((d) => {
    porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor;
  });
  const topCategorias = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, valor]) => ({ categoria: cat, valor: Math.round(valor * 100) / 100 }));

  return {
    totalDespesas: Math.round(totalDespesas * 100) / 100,
    totalPago: Math.round(totalPago * 100) / 100,
    totalPendente: Math.round((totalDespesas - totalPago) * 100) / 100,
    totalEntradas: Math.round(totalEntradas * 100) / 100,
    totalSaidasCaixa: Math.round(totalSaidasCaixa * 100) / 100,
    recorrenteAnual: Math.round(recorrenteAnual * 100) / 100,
    liquidoAno: Math.round((totalEntradas - totalDespesas - recorrenteAnual - totalSaidasCaixa) * 100) / 100,
    topCategorias,
    totalCompras: compras.reduce((s, c) => s + c.total, 0),
    comprasPendentes: compras.filter((c) => !c.comprado).length,
    recorrentes: recorrentes.map((r) => ({ item: r.item, valor: r.valor })),
  };
};

const AIInsightsPanel = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);

  const gerar = async () => {
    setLoading(true);
    try {
      const summary = buildSummary(props);
      const { data, error } = await supabase.functions.invoke<Insights | { error: string }>("ai-insights", {
        method: "POST",
        body: summary,
      });
      if (error) throw error;
      if (data && "error" in data) throw new Error(data.error);
      setInsights(data as Insights);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar insights";
      toast({ title: "Falha ao gerar análise", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise Inteligente
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Insights gerados por IA com base nos seus dados de 2026.
          </p>
        </div>
        <Button onClick={gerar} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {insights ? "Atualizar" : "Gerar análise"}
        </Button>
      </div>

      {!insights && !loading && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Clique em <strong>Gerar análise</strong> para receber sugestões personalizadas.
        </p>
      )}

      {insights && (
        <div className="space-y-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-sm text-foreground">{insights.resumo}</p>
          </div>

          <Section icon={AlertTriangle} color="text-chart-3" bg="bg-chart-3/10" title="Alertas" items={insights.alertas} />
          <Section icon={PiggyBank} color="text-accent" bg="bg-accent/10" title="Onde economizar" items={insights.oportunidadesEconomia} />
          <Section icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10" title="Sugestões de investimento" items={insights.sugestoesInvestimento} />

          <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-3">
            <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Próximo passo</p>
              <p className="text-sm text-foreground">{insights.proximoPasso}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground italic">
            ⚠️ Sugestões de investimento são educacionais. Não constituem recomendação financeira profissional.
          </p>
        </div>
      )}
    </div>
  );
};

const Section = ({
  icon: Icon, color, bg, title, items,
}: { icon: any; color: string; bg: string; title: string; items: string[] }) => (
  <div>
    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
      <span className={`p-1 rounded ${bg}`}><Icon className={`h-3.5 w-3.5 ${color}`} /></span>
      {title}
    </h4>
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-border">{t}</li>
      ))}
    </ul>
  </div>
);

export default AIInsightsPanel;
