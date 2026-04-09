import { Despesa, formatCurrency, meses } from "@/data/financeiro2026";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";

interface DespesasTableProps {
  despesas: Despesa[];
  onTogglePago: (realIndex: number) => void;
}

const DespesasTable = ({ despesas, onTogglePago }: DespesasTableProps) => {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("all");
  const [mesFiltro, setMesFiltro] = useState<string>("all");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("all");

  const categorias = useMemo(() => [...new Set(despesas.map((d) => d.categoria))].sort(), [despesas]);
  const mesesDisponiveis = useMemo(() => [...new Set(despesas.map((d) => d.mesNum))].sort((a, b) => a - b), [despesas]);

  const filtered = useMemo(() => despesas.filter((d) => {
    if (busca) {
      const q = busca.toLowerCase();
      if (!d.item.toLowerCase().includes(q) && !d.categoria.toLowerCase().includes(q) && !d.forma.toLowerCase().includes(q)) return false;
    }
    if (statusFiltro === "pago" && !d.pago) return false;
    if (statusFiltro === "pendente" && d.pago) return false;
    if (mesFiltro !== "all" && d.mesNum !== Number(mesFiltro)) return false;
    if (categoriaFiltro !== "all" && d.categoria !== categoriaFiltro) return false;
    return true;
  }), [despesas, busca, statusFiltro, mesFiltro, categoriaFiltro]);

  const totalFiltered = filtered.reduce((s, d) => s + d.valor, 0);
  const hasLocalFilter = busca || statusFiltro !== "all" || mesFiltro !== "all" || categoriaFiltro !== "all";

  const clearFilters = () => {
    setBusca("");
    setStatusFiltro("all");
    setMesFiltro("all");
    setCategoriaFiltro("all");
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Controle de Despesas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} de {despesas.length} registros · Total: <span className="text-foreground font-medium">{formatCurrency(totalFiltered)}</span>
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item, categoria ou forma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pago">✅ Pagos</SelectItem>
            <SelectItem value="pendente">⏳ Pendentes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mesFiltro} onValueChange={setMesFiltro}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos meses</SelectItem>
            {mesesDisponiveis.map((m) => (
              <SelectItem key={m} value={m.toString()}>{meses[m - 1]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasLocalFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5 mr-1" /> Limpar
          </Button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 text-muted-foreground font-medium">Mês</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Categoria</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Item</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Forma</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Valor</th>
              <th className="text-center p-3 text-muted-foreground font-medium">Pago</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nenhum registro encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const origIdx = despesas.indexOf(d);
                return (
                  <tr key={origIdx} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${d.pago ? "" : "bg-destructive/5"}`}>
                    <td className="p-3 text-muted-foreground">{d.mes}</td>
                    <td className="p-3 text-foreground">{d.categoria}</td>
                    <td className="p-3 text-foreground font-medium">{d.item}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{d.forma}</Badge>
                    </td>
                    <td className="p-3 text-right text-foreground">{formatCurrency(d.valor)}</td>
                    <td className="p-3 text-center">
                      <Switch checked={d.pago} onCheckedChange={() => onTogglePago(origIdx)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DespesasTable;
