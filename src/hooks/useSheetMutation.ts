import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MutationArgs {
  sheet: "Despesas" | "Aquisições" | "Caixa";
  rowNumber: number;
  column: string;
  value: string;
}

export const useSheetMutation = () => {
  const [pending, setPending] = useState(0);

  const mutate = useCallback(async (args: MutationArgs) => {
    setPending((n) => n + 1);
    try {
      const { error } = await supabase.functions.invoke("sheets-sync", {
        method: "POST",
        body: args,
      });
      if (error) throw error;
      return { ok: true as const };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao gravar";
      return { ok: false as const, error: msg };
    } finally {
      setPending((n) => n - 1);
    }
  }, []);

  return { mutate, pending: pending > 0 };
};
