import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Compra, Despesa, DespesaRecorrente } from "@/data/financeiro2026";

interface SheetPayload {
  compras: Compra[];
  despesas: Despesa[];
  recorrentes: DespesaRecorrente[];
  meta?: {
    comprasCount: number;
    despesasCount: number;
    recorrentesCount: number;
    fetchedAt: string;
  };
}

interface State {
  data: SheetPayload | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFinanceiroSheet = (): State => {
  const [data, setData] = useState<SheetPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke<SheetPayload>(
        "sheets-sync",
        { method: "GET" },
      );
      if (fnError) throw fnError;
      if (!res) throw new Error("Resposta vazia da planilha");
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar planilha";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, refetch: load };
};
