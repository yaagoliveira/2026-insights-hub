import { useState, useMemo, useEffect, useCallback } from "react";
import { DollarSign, ShoppingCart, CreditCard, CheckCircle, LayoutDashboard, Receipt, Package, RefreshCw, AlertCircle, PackageCheck, Wallet } from "lucide-react";
import { despesasRecorrentes as recorrentesFallback, Compra, Despesa, DespesaRecorrente, MovimentoCaixa } from "@/data/financeiro2026";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import ComprasTable from "@/components/ComprasTable";
import DespesasMensaisChart from "@/components/DespesasMensaisChart";
import CategoriasPieChart from "@/components/CategoriasPieChart";
import InsightsPanel from "@/components/InsightsPanel";
import RecorrentesCard from "@/components/RecorrentesCard";
import DashboardFilters from "@/components/DashboardFilters";
import EvolucaoChart from "@/components/EvolucaoChart";
import DespesasTable from "@/components/DespesasTable";
import FluxoCaixaPanel from "@/components/FluxoCaixaPanel";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import { collectCategorias, filterCompras, filterDespesas, filterRecorrentes, withOriginalIndex } from "@/lib/financeiro";
import { useFinanceiroSheet } from "@/hooks/useFinanceiroSheet";
import { useSheetMutation } from "@/hooks/useSheetMutation";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [despesasState, setDespesasState] = useState<Despesa[]>([]);
  const [comprasState, setComprasState] = useState<Compra[]>([]);
  const [recorrentesState, setRecorrentesState] = useState<DespesaRecorrente[]>(recorrentesFallback);
  const [caixaState, setCaixaState] = useState<MovimentoCaixa[]>([]);

  const { data: sheetData, loading: sheetLoading, error: sheetError, refetch } = useFinanceiroSheet();
  const { mutate: mutateSheet } = useSheetMutation();

  useEffect(() => {
    if (sheetData) {
      setDespesasState(sheetData.despesas ?? []);
      setComprasState(sheetData.compras ?? []);
      setRecorrentesState(
        sheetData.recorrentes && sheetData.recorrentes.length > 0
          ? sheetData.recorrentes
          : recorrentesFallback,
      );
      setCaixaState(sheetData.caixa ?? []);
    }
  }, [sheetData]);

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
    () => filterRecorrentes(recorrentesState, categoriaFiltro),
    [recorrentesState, categoriaFiltro],
  );
  const categoriasDisponiveis = useMemo(
    () => collectCategorias(despesasState, comprasState, recorrentesState),
    [despesasState, comprasState, recorrentesState],
  );

  // ---- Totais (memoizados em um único pass) ----
  const totaisCompras = useMemo(() => {
    let total = 0, prioritario = 0, qtdPrio = 0, comprado = 0, qtdComp = 0;
    for (const c of comprasFiltradas) {
      total += c.total;
      if (c.prioridade === "Sim") { prioritario += c.total; qtdPrio++; }
      if (c.comprado) { comprado += c.total; qtdComp++; }
    }
    return { total, prioritario, qtdPrio, comprado, qtdComp };
  }, [comprasFiltradas]);

  const totaisDespesas = useMemo(() => {
    let total = 0, pago = 0;
    for (const d of despesasFiltradas) {
      total += d.valor;
      if (d.pago) pago += d.valor;
    }
    return { total, pago, pendente: total - pago };
  }, [despesasFiltradas]);

  const percComprado = totaisCompras.total > 0
    ? ((totaisCompras.comprado / totaisCompras.total) * 100).toFixed(1)
    : "0";
  const percPago = totaisDespesas.total > 0
    ? ((totaisDespesas.pago / totaisDespesas.total) * 100).toFixed(1)
    : "0";

  const hasGlobalFilter = mesFiltro !== null || categoriaFiltro !== null;
  const resumoCompras = hasGlobalFilter ? `${comprasFiltradas.length} itens em foco` : `${comprasState.length} itens no total`;
  const resumoDespesas = hasGlobalFilter ? `${despesasFiltradas.length} registros em foco` : "Previsto + realizado";
  const resumoPago = totaisDespesas.total > 0 ? `${percPago}% do total em foco` : "Nenhuma despesa encontrada";
  const resumoPendente = hasGlobalFilter ? "Restante no filtro atual" : "Restante a pagar";
  const resumoPrioridade = totaisCompras.qtdPrio > 0
    ? `${totaisCompras.qtdPrio} itens marcados como "Sim"`
    : "Nenhum item com prioridade alta";

  // ---- Mutations otimistas com rollback ----
  const handleTogglePago = useCallback(async (realIndex: number) => {
    const target = despesasState[realIndex];
    if (!target) return;
    const next = !target.pago;
    setDespesasState((prev) => {
      const arr = [...prev];
      arr[realIndex] = { ...arr[realIndex], pago: next };
      return arr;
    });
    if (!target.rowNumber) return; // dados de fallback sem linha
    const res = await mutateSheet({
      sheet: "Despesas",
      rowNumber: target.rowNumber,
      column: "Pago",
      value: next ? "Sim" : "",
    });
    if (!res.ok) {
      setDespesasState((prev) => {
        const arr = [...prev];
        arr[realIndex] = { ...arr[realIndex], pago: target.pago };
        return arr;
      });
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" });
    }
  }, [despesasState, mutateSheet]);

  const handlePrioridadeChange = useCallback(async (index: number, value: string) => {
    const target = comprasState[index];
    if (!target) return;
    const previous = target.prioridade;
    setComprasState((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], prioridade: value };
      return arr;
    });
    if (!target.rowNumber) return;
    const res = await mutateSheet({
      sheet: "Aquisições",
      rowNumber: target.rowNumber,
      column: "Prioridade",
      value,
    });
    if (!res.ok) {
      setComprasState((prev) => {
        const arr = [...prev];
        arr[index] = { ...arr[index], prioridade: previous };
        return arr;
      });
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" });
    }
  }, [comprasState, mutateSheet]);

  const handleToggleComprado = useCallback(async (index: number) => {
    const target = comprasState[index];
    if (!target) return;
    const next = !target.comprado;
    setComprasState((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], comprado: next };
      return arr;
    });
    if (!target.rowNumber) return;
    const res = await mutateSheet({
      sheet: "Aquisições",
      rowNumber: target.rowNumber,
      column: "Comprado",
      value: next ? "Sim" : "",
    });
    if (!res.ok) {
      setComprasState((prev) => {
        const arr = [...prev];
        arr[index] = { ...arr[index], comprado: target.comprado };
        return arr;
      });
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" });
    }
  }, [comprasState, mutateSheet]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">💰 Finanças 2026</h1>
            <p className="text-xs text-muted-foreground">Painel de acompanhamento financeiro pessoal</p>
          </div>
          <div className="flex items-center gap-3">
            {sheetError && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-1.5" title={sheetError}>
                <AlertCircle className="w-3.5 h-3.5" />
                Erro ao sincronizar
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <div className={`w-2 h-2 rounded-full ${sheetLoading ? "bg-amber-500 animate-pulse" : sheetError ? "bg-destructive" : "bg-primary animate-pulse"}`} />
              {sheetLoading ? "Sincronizando…" : sheetData?.meta?.fetchedAt ? `Atualizado ${new Date(sheetData.meta.fetchedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Planilha conectada"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={sheetLoading}
              className="h-8 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${sheetLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
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
            <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="geral" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="caixa" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <Wallet className="h-4 w-4" />
                <span>Caixa</span>
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
                <StatCard title="Aquisições Planejadas" value={totaisCompras.total} icon={ShoppingCart} subtitle={resumoCompras} />
                <StatCard title="Despesas 2026" value={totaisDespesas.total} icon={DollarSign} subtitle={resumoDespesas} trend="up" />
                <StatCard title="Já Pago" value={totaisDespesas.pago} icon={CheckCircle} subtitle={resumoPago} trend="down" />
                <StatCard title="Pendente" value={totaisDespesas.pendente} icon={CreditCard} subtitle={resumoPendente} />
              </div>

              <FluxoCaixaPanel
                caixa={caixaState}
                despesas={despesasFiltradas}
                recorrentes={recorrentesFiltradas}
                mesFiltro={mesFiltro}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DespesasMensaisChart despesas={despesasFiltradas} />
                <CategoriasPieChart despesas={despesasFiltradas} />
              </div>

              <EvolucaoChart despesas={despesasFiltradas} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightsPanel despesas={despesasFiltradas} compras={comprasFiltradas} recorrentes={recorrentesFiltradas} />
                <RecorrentesCard recorrentes={recorrentesFiltradas} />
              </div>

              <AIInsightsPanel
                despesas={despesasFiltradas}
                compras={comprasFiltradas}
                recorrentes={recorrentesFiltradas}
                caixa={caixaState}
              />
            </TabsContent>

            {/* ===== ABA CAIXA ===== */}
            <TabsContent value="caixa" className="space-y-6">
              <FluxoCaixaPanel
                caixa={caixaState}
                despesas={despesasFiltradas}
                recorrentes={recorrentesFiltradas}
                mesFiltro={mesFiltro}
              />
              <AIInsightsPanel
                despesas={despesasFiltradas}
                compras={comprasFiltradas}
                recorrentes={recorrentesFiltradas}
                caixa={caixaState}
              />
            </TabsContent>

            {/* ===== ABA DESPESAS ===== */}
            <TabsContent value="despesas" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Despesas" value={totaisDespesas.total} icon={DollarSign} subtitle={resumoDespesas} trend="up" />
                <StatCard title="Já Pago" value={totaisDespesas.pago} icon={CheckCircle} subtitle={resumoPago} trend="down" />
                <StatCard title="Pendente" value={totaisDespesas.pendente} icon={CreditCard} subtitle={resumoPendente} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total em Aquisições" value={totaisCompras.total} icon={ShoppingCart} subtitle={resumoCompras} />
                <StatCard
                  title="Já Comprado"
                  value={totaisCompras.comprado}
                  icon={PackageCheck}
                  subtitle={`${totaisCompras.qtdComp} de ${comprasFiltradas.length} itens · ${percComprado}%`}
                  trend="down"
                />
                <StatCard
                  title="A Adquirir"
                  value={totaisCompras.total - totaisCompras.comprado}
                  icon={Package}
                  subtitle={`${comprasFiltradas.length - totaisCompras.qtdComp} itens restantes`}
                />
                <StatCard title="Prioridade Alta" value={totaisCompras.prioritario} icon={CreditCard} subtitle={resumoPrioridade} />
              </div>

              <ComprasTable
                compras={comprasFiltradas}
                onPrioridadeChange={handlePrioridadeChange}
                onToggleComprado={handleToggleComprado}
              />
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
