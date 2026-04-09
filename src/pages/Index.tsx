import { useState, useMemo } from "react";
import { DollarSign, ShoppingCart, CreditCard, CheckCircle } from "lucide-react";
import { compras as comprasInitial, despesas as despesasInitial, formatCurrency, Compra, Despesa } from "@/data/financeiro2026";
import StatCard from "@/components/StatCard";
import ComprasTable from "@/components/ComprasTable";
import DespesasMensaisChart from "@/components/DespesasMensaisChart";
import CategoriasPieChart from "@/components/CategoriasPieChart";
import InsightsPanel from "@/components/InsightsPanel";
import RecorrentesCard from "@/components/RecorrentesCard";
import DashboardFilters from "@/components/DashboardFilters";
import EvolucaoChart from "@/components/EvolucaoChart";
import DespesasTable from "@/components/DespesasTable";

const Index = () => {
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [despesasState, setDespesasState] = useState<Despesa[]>([...despesasInitial]);
  const [comprasState, setComprasState] = useState<Compra[]>([...comprasInitial]);

  const despesasFiltradas = useMemo(() => {
    return despesasState.filter((d) => {
      if (mesFiltro !== null && d.mesNum !== mesFiltro) return false;
      if (categoriaFiltro && d.categoria !== categoriaFiltro) return false;
      return true;
    });
  }, [despesasState, mesFiltro, categoriaFiltro]);

  const totalCompras = comprasState.reduce((s, c) => s + c.total, 0);
  const totalDespesas = despesasState.reduce((s, d) => s + d.valor, 0);
  const totalPago = despesasState.filter((d) => d.pago).reduce((s, d) => s + d.valor, 0);
  const totalPendente = totalDespesas - totalPago;

  const handleTogglePago = (filteredIndex: number) => {
    const target = despesasFiltradas[filteredIndex];
    const realIndex = despesasState.findIndex((d) => d === target);
    if (realIndex === -1) return;
    setDespesasState((prev) => {
      const next = [...prev];
      next[realIndex] = { ...next[realIndex], pago: !next[realIndex].pago };
      return next;
    });
  };

  const handlePrioridadeChange = (index: number, value: string) => {
    setComprasState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], prioridade: value };
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Finanças 2026</h1>
            <p className="text-xs text-muted-foreground">Painel de acompanhamento financeiro</p>
          </div>
          <div className="text-xs text-muted-foreground">Atualizado em Abril 2026</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros */}
        <DashboardFilters
          mesFiltro={mesFiltro}
          setMesFiltro={setMesFiltro}
          categoriaFiltro={categoriaFiltro}
          setCategoriaFiltro={setCategoriaFiltro}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Compras Planejadas" value={totalCompras} icon={ShoppingCart} subtitle={`${comprasState.length} itens`} />
          <StatCard title="Total Despesas 2026" value={totalDespesas} icon={DollarSign} subtitle="Previsto + realizado" trend="up" />
          <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle="Atualizado em tempo real" trend="down" />
          <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle="Restante a pagar" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DespesasMensaisChart />
          <CategoriasPieChart />
        </div>

        {/* Evolução */}
        <EvolucaoChart mesFiltro={mesFiltro} categoriaFiltro={categoriaFiltro} />

        {/* Insights + Recorrentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightsPanel />
          <RecorrentesCard />
        </div>

        {/* Controle de Despesas */}
        <DespesasTable despesas={despesasFiltradas} onTogglePago={handleTogglePago} />

        {/* Tabela de Compras */}
        <ComprasTable compras={comprasState} onPrioridadeChange={handlePrioridadeChange} />
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">Dashboard financeiro pessoal · 2026</p>
      </footer>
    </div>
  );
};

export default Index;
