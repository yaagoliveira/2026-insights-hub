// Edge Function: ai-insights
// Recebe resumo financeiro e devolve análise estruturada via Lovable AI Gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um consultor financeiro pessoal brasileiro.
Analise os dados financeiros recebidos (em BRL) e devolva um JSON com:
- resumo: parágrafo curto (máx 2 frases) sobre a saúde financeira atual.
- alertas: 2-4 itens com riscos imediatos (gastos crescentes, categorias dominantes, recorrentes pesados).
- oportunidadesEconomia: 2-4 sugestões concretas para reduzir gastos com base nas categorias mais altas.
- sugestoesInvestimento: 2-3 sugestões EDUCACIONAIS de onde alocar a sobra mensal (renda fixa, tesouro selic, CDB, fundos DI, reserva de emergência). Cite tipos genéricos, NUNCA marcas/corretoras específicas. Inclua aviso de que é educacional.
- proximoPasso: 1 ação prática para o próximo mês.
Seja direto, em PT-BR, sem floreios. Use valores específicos dos dados quando relevante.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const payload = await req.json();

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Dados financeiros do usuário (2026):\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analise_financeira",
            description: "Análise financeira estruturada",
            parameters: {
              type: "object",
              properties: {
                resumo: { type: "string" },
                alertas: { type: "array", items: { type: "string" } },
                oportunidadesEconomia: { type: "array", items: { type: "string" } },
                sugestoesInvestimento: { type: "array", items: { type: "string" } },
                proximoPasso: { type: "string" },
              },
              required: ["resumo", "alertas", "oportunidadesEconomia", "sugestoesInvestimento", "proximoPasso"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analise_financeira" } },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error [${resp.status}]: ${txt}`);
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Resposta IA sem tool call estruturado");
    }
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("ai-insights error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
