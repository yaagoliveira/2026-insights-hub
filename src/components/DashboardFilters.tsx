import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { meses } from "@/data/financeiro2026";

interface DashboardFiltersProps {
  mesFiltro: number | null;
  setMesFiltro: (v: number | null) => void;
  categoriaFiltro: string | null;
  setCategoriaFiltro: (v: string | null) => void;
  categorias: string[];
}

const DashboardFilters = ({ mesFiltro, setMesFiltro, categoriaFiltro, setCategoriaFiltro, categorias }: DashboardFiltersProps) => {
  const hasFilter = mesFiltro !== null || categoriaFiltro !== null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4 text-muted-foreground" />
        Filtros
      </div>

      <Select value={mesFiltro?.toString() ?? "all"} onValueChange={(v) => setMesFiltro(v === "all" ? null : Number(v))}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder="Todos os meses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os meses</SelectItem>
          {meses.map((m, i) => (
            <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoriaFiltro ?? "all"} onValueChange={(v) => setCategoriaFiltro(v === "all" ? null : v)}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Todas categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categorias.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={() => { setMesFiltro(null); setCategoriaFiltro(null); }} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
};

export default DashboardFilters;
