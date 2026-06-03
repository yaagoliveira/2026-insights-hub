## Objetivo
Resolver: (1) toggle "Pago" perdido ao sincronizar, (2) performance, (3) vínculo despesas↔caixa com valor líquido + insights por IA.

## 1. Persistência no Google Sheets (corrige "Pago" não atualiza)
Hoje o toggle só altera estado local — qualquer refetch sobrescreve. Vou:
- Trocar escopo OAuth de `spreadsheets.readonly` → `spreadsheets` na edge `sheets-sync`.
- Adicionar handler `POST` na edge para gravar de volta:
  - `{ sheet: "Despesas", rowIndex, column: "Pago", value: "Sim"|"" }`
  - `{ sheet: "Aquisições", rowIndex, column: "Comprado"|"Prioridade", value }`
- Devolver junto a linha original (`rowNumber`) de cada item ao client, para escrita precisa.
- Hook `useFinanceiroMutations` faz update otimista + chama edge; rollback em erro com toast.

## 2. Nova aba "Caixa" na planilha
**Recomendação:** criar aba `Caixa` no mesmo Google Sheet (mantém único ponto de verdade, sincroniza automático, mesma autenticação).

Colunas sugeridas (linha 1 = cabeçalho):
```
Data | Categoria | Descrição | Valor | Tipo
```
- `Tipo` = `Entrada` ou `Saída` (caso queira registrar saídas avulsas).
- Parser na edge soma entradas/saídas por mês.

## 3. Métricas de valor líquido
Novo painel "Fluxo de Caixa":
- Receita mensal / anual
- Despesas pagas no período
- **Líquido = Entradas − (Despesas + Recorrentes)** com cor (positivo/negativo).
- Gráfico mensal de barras (entrada vs saída) + linha de saldo acumulado.

## 4. Insights com IA (Lovable AI)
Nova edge function `ai-insights` usando `google/gemini-3-flash-preview` via Lovable AI Gateway:
- Recebe resumo numérico (totais por categoria, receita, recorrentes, top gastos).
- Retorna JSON estruturado: `{ resumo, alertas[], oportunidadesEconomia[], sugestoesInvestimento[] }`.
- Componente `AIInsightsPanel` com botão "Gerar análise" (evita custo em cada render), cache da última resposta em estado.
- Disclaimer: sugestões educacionais, não recomendação financeira profissional.

## 5. Performance
- Memoizar custos pesados já está; vou adicionar:
  - Pré-agrupar despesas por `mesNum` e `categoria` num único `useMemo` reutilizado por todos os gráficos (hoje cada chart recalcula).
  - Estabilizar callbacks com `useCallback`.
  - `React.memo` em `DespesasMensaisChart`, `CategoriasPieChart`, `EvolucaoChart`.

## Arquivos afetados
- `supabase/functions/sheets-sync/index.ts` — escopo write, Caixa, POST, rowNumber.
- `supabase/functions/ai-insights/index.ts` — NOVO.
- `src/data/financeiro2026.ts` — tipo `MovimentoCaixa`, `rowNumber` opcional nos demais.
- `src/hooks/useFinanceiroSheet.ts` — incluir caixa no payload.
- `src/hooks/useFinanceiroMutations.ts` — NOVO (write-back + otimista).
- `src/components/CaixaPanel.tsx` — NOVO.
- `src/components/FluxoChart.tsx` — NOVO (entrada vs saída).
- `src/components/AIInsightsPanel.tsx` — NOVO.
- `src/pages/Index.tsx` — wiring, novas cards/seções.
- Memoizações em `DespesasMensaisChart`, `CategoriasPieChart`, `EvolucaoChart`.

## Aviso
Você precisa criar a aba **`Caixa`** na planilha com o cabeçalho acima. Sem ela, o vínculo de fluxo aparece zerado (não quebra o app).
