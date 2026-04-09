import { compras, formatCurrency } from "@/data/financeiro2026";
import { Badge } from "@/components/ui/badge";

const prioridadeColor = (p: string) => {
  if (p === "Sim") return "bg-primary/20 text-primary border-primary/30";
  if (p === "Não") return "bg-muted text-muted-foreground border-border";
  return "bg-accent/20 text-accent border-accent/30";
};

const ComprasTable = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Lista de Compras Previstas</h3>
      <p className="text-sm text-muted-foreground mt-1">{compras.length} itens planejados para 2026</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 text-muted-foreground font-medium">Categoria</th>
            <th className="text-left p-3 text-muted-foreground font-medium">Item</th>
            <th className="text-right p-3 text-muted-foreground font-medium">Valor</th>
            <th className="text-left p-3 text-muted-foreground font-medium">Prazo</th>
            <th className="text-center p-3 text-muted-foreground font-medium">Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((c, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              <td className="p-3 text-foreground">{c.categoria}</td>
              <td className="p-3 text-foreground font-medium">{c.item}</td>
              <td className="p-3 text-right text-foreground">{formatCurrency(c.total)}</td>
              <td className="p-3 text-muted-foreground">{c.prazo}</td>
              <td className="p-3 text-center">
                <Badge variant="outline" className={prioridadeColor(c.prioridade)}>
                  {c.prioridade}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ComprasTable;
