import { useState, useMemo } from "react";
import { DollarSign, ShoppingCart, CreditCard, CheckCircle, LayoutDashboard, Receipt, Package } from "lucide-react";
import { compras as comprasInitial, despesas as despesasInitial, despesasRecorrentes, Compra, Despesa } from "@/data/financeiro2026";
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
import { collectCategorias, filterCompras, filterDespesas, filterRecorrentes, withOriginalIndex } from "@/lib/financeiro";

const Index = () => {
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [despesasState, setDespesasState] = useState<Despesa[]>([...despesasInitial]);
  const [comprasState, setComprasState] = useState<Compra[]>([...comprasInitial]);

  const despesasIndexadas = useMemo(() => withOriginalIndex(despesasState), [despesasState]);
  const comprasIndexadas = useMemo(() => withOriginalIndex(comprasState), [comprasState]);

  const despesasFiltradas = useMemo(
    () => filterDespesas(despesasIndexadas, mesFiltro, categoriaFiltro),
    [despesasIndexadas, mesFiltro, categoriaFiltro],
  );
  const comprasFiltradas = useMemo(
    () => filterCompras(comprasIndexadas, mesFiltro, categoriaFiltro),
    [comprasIndexadas, mesFiltro, categoriaFiltro],
  );
  const recorrentesFiltradas = useMemo(
    () => filterRecorrentes(despesasRecorrentes, categoriaFiltro),
    [categoriaFiltro],
  );
  const categoriasDisponiveis = useMemo(
    () => collectCategorias(despesasState, comprasState, despesasRecorrentes),
    [despesasState, comprasState],
  );

  const totalCompras = useMemo(() => comprasFiltradas.reduce((s, c) => s + c.total, 0), [comprasFiltradas]);
  const comprasPrioritarias = useMemo(
    () => comprasFiltradas.filter((c) => c.prioridade === "Sim").reduce((s, c) => s + c.total, 0),
    [comprasFiltradas],
  );
  const quantidadePrioritarias = useMemo(
    () => comprasFiltradas.filter((c) => c.prioridade === "Sim").length,
    [comprasFiltradas],
  );
  const totalDespesas = useMemo(() => despesasFiltradas.reduce((s, d) => s + d.valor, 0), [despesasFiltradas]);
  const totalPago = useMemo(() => despesasFiltradas.filter((d) => d.pago).reduce((s, d) => s + d.valor, 0), [despesasFiltradas]);
  const totalPendente = totalDespesas - totalPago;
  const percPago = totalDespesas > 0 ? ((totalPago / totalDespesas) * 100).toFixed(1) : "0";
  const hasGlobalFilter = mesFiltro !== null || categoriaFiltro !== null;
  const resumoCompras = hasGlobalFilter ? `${comprasFiltradas.length} itens em foco` : `${comprasState.length} itens no total`;
  const resumoDespesas = hasGlobalFilter ? `${despesasFiltradas.length} registros em foco` : "Previsto + realizado";
  const resumoPago = totalDespesas > 0 ? `${percPago}% do total em foco` : "Nenhuma despesa encontrada";
  const resumoPendente = hasGlobalFilter ? "Restante no filtro atual" : "Restante a pagar";
  const resumoPrioridade = quantidadePrioritarias > 0
    ? `${quantidadePrioritarias} itens marcados como \"Sim\"`
    : "Nenhum item com prioridade alta";

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
        <div className="space-y-6">
          <DashboardFilters
            mesFiltro={mesFiltro}
            setMesFiltro={setMesFiltro}
            categoriaFiltro={categoriaFiltro}
            setCategoriaFiltro={setCategoriaFiltro}
            categorias={categoriasDisponiveis}
          />

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
                <span>Aquisições</span>
              </TabsTrigger>
            </TabsList>

            {/* ===== ABA GERAL ===== */}
            <TabsContent value="geral" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Aquisições Planejadas" value={totalCompras} icon={ShoppingCart} subtitle={resumoCompras} />
                <StatCard title="Despesas 2026" value={totalDespesas} icon={DollarSign} subtitle={resumoDespesas} trend="up" />
                <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle={resumoPago} trend="down" />
                <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle={resumoPendente} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DespesasMensaisChart despesas={despesasFiltradas} />
                <CategoriasPieChart despesas={despesasFiltradas} />
              </div>

              <EvolucaoChart despesas={despesasFiltradas} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightsPanel despesas={despesasFiltradas} compras={comprasFiltradas} recorrentes={recorrentesFiltradas} />
                <RecorrentesCard recorrentes={recorrentesFiltradas} />
              </div>
            </TabsContent>

            {/* ===== ABA DESPESAS ===== */}
            <TabsContent value="despesas" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Despesas" value={totalDespesas} icon={DollarSign} subtitle={resumoDespesas} trend="up" />
                <StatCard title="Já Pago" value={totalPago} icon={CheckCircle} subtitle={resumoPago} trend="down" />
                <StatCard title="Pendente" value={totalPendente} icon={CreditCard} subtitle={resumoPendente} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DespesasMensaisChart despesas={despesasFiltradas} />
                <EvolucaoChart despesas={despesasFiltradas} />
              </div>

              <DespesasTable despesas={despesasFiltradas} onTogglePago={handleTogglePago} />

              <RecorrentesCard recorrentes={recorrentesFiltradas} />
            </TabsContent>

            {/* ===== ABA AQUISIÇÕES ===== */}
            <TabsContent value="compras" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total em Aquisições" value={totalCompras} icon={ShoppingCart} subtitle={resumoCompras} />
                <StatCard title="Prioridade Alta" value={comprasPrioritarias} icon={CreditCard} subtitle={resumoPrioridade} />
              </div>

              <ComprasTable compras={comprasFiltradas} onPrioridadeChange={handlePrioridadeChange} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground">Dashboard financeiro pessoal · 2026</p>
      </footer>
    </div>
  );
};

export default Index;
