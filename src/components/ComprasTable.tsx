import { useState, useMemo } from "react";
import { Compra, formatCurrency } from "@/data/financeiro2026";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { IndexedItem } from "@/lib/financeiro";

const prazoToDate = (prazo: string): string => {
  const lower = prazo.toLowerCase();
  const monthMap: Record<string, string> = {
    janeiro: "31/01/2026", fevereiro: "28/02/2026", março: "31/03/2026",
    abril: "30/04/2026", maio: "31/05/2026", junho: "30/06/2026",
    julho: "31/07/2026", agosto: "31/08/2026", setembro: "30/09/2026",
    outubro: "31/10/2026", novembro: "30/11/2026", dezembro: "31/12/2026",
  };
  for (const [month, date] of Object.entries(monthMap)) {
    if (lower.includes(month)) return date;
  }
  if (lower.includes("60 dias")) return "09/06/2026";
  if (lower.includes("mensal")) return "Mensal";
  return "31/12/2026";
};

const prioridadeOptions = ["Sim", "Não", "Padrão", "Mais ou menos"] as const;

const prioridadeStyle = (p: string) => {
  switch (p) {
    case "Sim": return "bg-primary/20 text-primary border-primary/30";
    case "Não": return "bg-destructive/20 text-destructive border-destructive/30";
    case "Mais ou menos": return "bg-chart-3/20 text-chart-3 border-chart-3/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

interface ComprasTableProps {
  compras: IndexedItem<Compra>[];
  onPrioridadeChange: (index: number, value: string) => void;
}

const ComprasTable = ({ compras, onPrioridadeChange }: ComprasTableProps) => {
  const [busca, setBusca] = useState("");

  const filtered = useMemo(() => {
    if (!busca) return compras;
    const q = busca.toLowerCase();
    return compras.filter((c) =>
      c.item.toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q) || c.prazo.toLowerCase().includes(q)
    );
  }, [compras, busca]);

  const totalFiltered = filtered.reduce((s, c) => s + c.total, 0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">🛒 Lista de Aquisições Previstas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} de {compras.length} itens · Total: <span className="text-foreground font-medium">{formatCurrency(totalFiltered)}</span>
        </p>
      </div>
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item, categoria ou prazo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 text-muted-foreground font-medium">Categoria</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Item</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Valor</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Prazo</th>
              <th className="text-center p-3 text-muted-foreground font-medium">Término</th>
              <th className="text-center p-3 text-muted-foreground font-medium">Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                return (
                  <tr key={c.originalIndex} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-foreground">{c.categoria}</td>
                    <td className="p-3 text-foreground font-medium">{c.item}</td>
                    <td className="p-3 text-right text-foreground">{formatCurrency(c.total)}</td>
                    <td className="p-3 text-muted-foreground">{c.prazo}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-xs font-mono">
                        {prazoToDate(c.prazo)}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Select value={c.prioridade} onValueChange={(v) => onPrioridadeChange(c.originalIndex, v)}>
                        <SelectTrigger className="h-8 w-[140px] mx-auto text-xs">
                          <SelectValue>
                            <Badge variant="outline" className={`${prioridadeStyle(c.prioridade)} text-xs`}>
                              {c.prioridade}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {prioridadeOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              <Badge variant="outline" className={`${prioridadeStyle(opt)} text-xs`}>
                                {opt}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

export default ComprasTable;
