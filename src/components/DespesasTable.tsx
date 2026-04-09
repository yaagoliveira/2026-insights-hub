import { Despesa, formatCurrency } from "@/data/financeiro2026";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface DespesasTableProps {
  despesas: Despesa[];
  onTogglePago: (index: number) => void;
}

const DespesasTable = ({ despesas, onTogglePago }: DespesasTableProps) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="p-5 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">Controle de Despesas</h3>
      <p className="text-sm text-muted-foreground mt-1">{despesas.length} registros · Alterne o status de pagamento</p>
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
          {despesas.map((d, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              <td className="p-3 text-muted-foreground">{d.mes}</td>
              <td className="p-3 text-foreground">{d.categoria}</td>
              <td className="p-3 text-foreground font-medium">{d.item}</td>
              <td className="p-3">
                <Badge variant="outline" className="text-xs">{d.forma}</Badge>
              </td>
              <td className="p-3 text-right text-foreground">{formatCurrency(d.valor)}</td>
              <td className="p-3 text-center">
                <Switch checked={d.pago} onCheckedChange={() => onTogglePago(i)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DespesasTable;
