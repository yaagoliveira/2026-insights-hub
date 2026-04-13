import { useState, useMemo } from "react";
import { DollarSign, ShoppingCart, CreditCard, CheckCircle, LayoutDashboard, Receipt, Package } from "lucide-react";
import { compras as comprasInitial, despesas as despesasInitial, formatCurrency, Compra, Despesa } from "@/data/financeiro2026";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  const totalCompras = useMemo(() => comprasState.reduce((s, c) => s + c.total, 0), [comprasState]);
  const totalDespesas = useMemo(() => despesasState.reduce((s, d) => s + d.valor, 0), [despesasState]);
  const totalPago = useMemo(() => despesasState.filter((d) => d.pago).reduce((s, d) => s + d.valor, 0), [despesasState]);
  const totalPendente = totalDespesas - totalPago;
  const percPago = totalDespesas > 0 ? ((totalPago / totalDespesas) * 100).toFixed(1) : "0";

  const handleTogglePago = (realIndex: number) => {
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">💰 Finanças 2026</h1>
            <p className="text-xs text-muted-foreground">Painel de acompanhamento financeiro pessoal</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Atualizado em Abril 2026
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="geral" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="despesas" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <Receipt className="h-4 w-4" />
              <span>Despesas</span>
            </TabsTrigger>
            <TabsTrigger value="compras" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <Package className="h-4 w-4" />
              <span>Compras</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== ABA GERAL ===== */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Compras Planejadas" value={totalCompras} icon={ShoppingCart} subtitle={`${comprasState.length} itens no total`} />
              <StatCard title="Despesas 2026" value={totalDespesas} icon={DollarSign} subtitle="Previsto + realizado" trend="up" />
              <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle={`${percPago}% do total`} trend="down" />
              <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle="Restante a pagar" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DespesasMensaisChart />
              <CategoriasPieChart />
            </div>

            <EvolucaoChart mesFiltro={mesFiltro} categoriaFiltro={categoriaFiltro} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InsightsPanel />
              <RecorrentesCard />
            </div>
          </TabsContent>

          {/* ===== ABA DESPESAS ===== */}
          <TabsContent value="despesas" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Despesas" value={totalDespesas} icon={DollarSign} subtitle="Previsto + realizado" trend="up" />
              <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle={`${percPago}% do total`} trend="down" />
              <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle="Restante a pagar" />
            </div>

            <DashboardFilters
              mesFiltro={mesFiltro}
              setMesFiltro={setMesFiltro}
              categoriaFiltro={categoriaFiltro}
              setCategoriaFiltro={setCategoriaFiltro}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DespesasMensaisChart />
              <EvolucaoChart mesFiltro={mesFiltro} categoriaFiltro={categoriaFiltro} />
            </div>

            <DespesasTable despesas={despesasFiltradas} onTogglePago={handleTogglePago} />

            <RecorrentesCard />
          </TabsContent>

          {/* ===== ABA COMPRAS ===== */}
          <TabsContent value="compras" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Total Compras Planejadas" value={totalCompras} icon={ShoppingCart} subtitle={`${comprasState.length} itens no total`} />
              <StatCard title="Investimento Pendente" value={totalCompras} icon={CreditCard} subtitle="Valor total previsto" />
            </div>

            <ComprasTable compras={comprasState} onPrioridadeChange={handlePrioridadeChange} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">Dashboard financeiro pessoal · 2026</p>
      </footer>
    </div>
  );
};

export default Index;
