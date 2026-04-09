import { DollarSign, ShoppingCart, CreditCard, CheckCircle } from "lucide-react";
import { compras, despesas, formatCurrency } from "@/data/financeiro2026";
import StatCard from "@/components/StatCard";
import ComprasTable from "@/components/ComprasTable";
import DespesasMensaisChart from "@/components/DespesasMensaisChart";
import CategoriasPieChart from "@/components/CategoriasPieChart";
import InsightsPanel from "@/components/InsightsPanel";
import RecorrentesCard from "@/components/RecorrentesCard";

const Index = () => {
  const totalCompras = compras.reduce((s, c) => s + c.total, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const totalPago = despesas.filter((d) => d.pago).reduce((s, d) => s + d.valor, 0);
  const totalPendente = totalDespesas - totalPago;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Finanças 2026</h1>
            <p className="text-xs text-muted-foreground">Painel de acompanhamento financeiro</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Atualizado em Abril 2026
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Compras Planejadas" value={totalCompras} icon={ShoppingCart} subtitle={`${compras.length} itens`} />
          <StatCard title="Total Despesas 2026" value={totalDespesas} icon={DollarSign} subtitle="Previsto + realizado" trend="up" />
          <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle="Jan–Abr 2026" trend="down" />
          <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle="Mai–Dez 2026" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DespesasMensaisChart />
          <CategoriasPieChart />
        </div>

        {/* Insights + Recorrentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightsPanel />
          <RecorrentesCard />
        </div>

        {/* Tabela de Compras */}
        <ComprasTable />
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">
          Dashboard financeiro pessoal · 2026
        </p>
      </footer>
    </div>
  );
};

export default Index;
