export interface Compra {
  categoria: string;
  item: string;
  valor: number;
  prazo: string;
  total: number;
  prioridade: string;
}

export interface Despesa {
  forma: string;
  categoria: string;
  item: string;
  valor: number;
  mes: string;
  pago: boolean;
  mesNum: number;
}

export interface DespesaRecorrente {
  forma: string;
  categoria: string;
  item: string;
  valor: number;
  qntMes: number;
  totalAnual: number;
}

export const compras: Compra[] = [
  { categoria: "Quarto", item: "Escrivaninha", valor: 350, prazo: "até 60 dias", total: 350, prioridade: "Sim" },
  { categoria: "Carro", item: "Coifa do câmbio", valor: 40, prazo: "até 60 dias", total: 40, prioridade: "Sim" },
  { categoria: "Carro", item: "Borracha Pingadeira Portas", valor: 200, prazo: "até 60 dias", total: 200, prioridade: "Sim" },
  { categoria: "Presente", item: "Dia das Mães", valor: 150, prazo: "Maio", total: 150, prioridade: "Padrão" },
  { categoria: "Presente", item: "Dia dos Pais", valor: 150, prazo: "Agosto", total: 150, prioridade: "Padrão" },
  { categoria: "Presente", item: "Aniversário Tha", valor: 150, prazo: "Abril", total: 150, prioridade: "Padrão" },
  { categoria: "Presente", item: "Aniversário Pai", valor: 300, prazo: "Maio", total: 300, prioridade: "Padrão" },
  { categoria: "Presente", item: "Aniversário Mãe", valor: 300, prazo: "Setembro", total: 300, prioridade: "Padrão" },
  { categoria: "Lazer", item: "iPhone", valor: 8000, prazo: "Abril", total: 8000, prioridade: "Não" },
  { categoria: "Autocuidado", item: "Cabelo", valor: 90, prazo: "Mensal", total: 990, prioridade: "Padrão" },
  { categoria: "Quarto", item: "Lençol", valor: 50, prazo: "Fevereiro", total: 50, prioridade: "Padrão" },
  { categoria: "Quarto", item: "Travesseiro", valor: 120, prazo: "Fevereiro", total: 120, prioridade: "Padrão" },
  { categoria: "Lazer", item: "PS5", valor: 2500, prazo: "até dezembro", total: 2500, prioridade: "Não" },
  { categoria: "Autocuidado", item: "Cirurgia do Olho", valor: 8000, prazo: "até abril", total: 8000, prioridade: "Sim" },
  { categoria: "Viagem", item: "Passaporte", valor: 260, prazo: "Março", total: 260, prioridade: "Mais ou menos" },
  { categoria: "Utilidade", item: "Tatuagem", valor: 1000, prazo: "até junho", total: 1000, prioridade: "Não" },
];

export const despesasRecorrentes: DespesaRecorrente[] = [
  { forma: "Boleto", categoria: "Casa", item: "Internet", valor: 100, qntMes: 12, totalAnual: 1200 },
  { forma: "Boleto", categoria: "Carro", item: "Seguro", valor: 81, qntMes: 12, totalAnual: 972 },
  { forma: "Cartão", categoria: "Celular", item: "Vivo", valor: 65, qntMes: 10, totalAnual: 650 },
  { forma: "Transferência", categoria: "Saúde", item: "Plano de Saúde", valor: 700, qntMes: 12, totalAnual: 8400 },
];

export const despesas: Despesa[] = [
  // Janeiro
  { forma: "Boleto", categoria: "Casa", item: "Internet", valor: 100, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Boleto", categoria: "Carro", item: "Seguro", valor: 81, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.43, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Cristal", item: "Veterinário", valor: 255.45, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Roupa", item: "Parcela", valor: 48.90, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Utilidade", item: "Mercado", valor: 19.90, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Restaurante", valor: 30.12, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Ponto Certo", valor: 7, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Modena", valor: 5.50, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Farmácia", item: "Remédio", valor: 51.90, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Viagem", item: "Passagem", valor: 279.86, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Carro", item: "Combustível", valor: 131.29, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "KFC", valor: 56.90, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Entreveiro", valor: 25, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Cristal", item: "Ração", valor: 9, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Cristal", item: "Banho", valor: 31.80, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Utilidade", item: "Mercado", valor: 67.53, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Almoço", valor: 33.96, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Comida", item: "Almoço", valor: 30, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Cristal", item: "Luto", valor: 118.75, mes: "Janeiro", pago: true, mesNum: 1 },
  { forma: "Cartão", categoria: "Celular", item: "Vivo", valor: 43, mes: "Janeiro", pago: true, mesNum: 1 },
  // Fevereiro
  { forma: "Boleto", categoria: "Casa", item: "Internet", valor: 100, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Boleto", categoria: "Carro", item: "Seguro", valor: 81, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.10, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Cristal", item: "Veterinário", valor: 255.45, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Roupa", item: "Parcela", valor: 48.90, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Cristal", item: "Luto", valor: 118.75, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Comida", item: "BK", valor: 74.80, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Cuidado", item: "Cabelo", valor: 38, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Utilidade", item: "Mercado", valor: 35.88, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Passagem", valor: 79.68, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Comida", item: "Almoço", valor: 5.24, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Ônibus", valor: 82.33, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Farmácia", item: "Remédio", valor: 9.99, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Uber", valor: 27.29, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Almoço", valor: 78, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Uber", valor: 93.39, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Celular", item: "Vivo", valor: 43, mes: "Fevereiro", pago: true, mesNum: 2 },
  { forma: "Cartão", categoria: "Viagem", item: "Café", valor: 20.90, mes: "Fevereiro", pago: true, mesNum: 2 },
  // Março
  { forma: "Boleto", categoria: "Casa", item: "Internet", valor: 100, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Boleto", categoria: "Carro", item: "Seguro", valor: 81, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.43, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Cristal", item: "Veterinário", valor: 255.45, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Cristal", item: "Luto", valor: 118.75, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Viagem", item: "Passagem", valor: 79.68, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Viagem", item: "Terno", valor: 380, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Viagem", item: "iFood", valor: 182.68, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Viagem", item: "iFood", valor: 32.98, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Viagem", item: "Uber", valor: 48.94, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Carro", item: "Combustível", valor: 293.35, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Alimentação", item: "iFood", valor: 26.82, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Almoço", item: "Restaurante", valor: 43.53, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Celular", item: "Vivo", valor: 64.64, mes: "Março", pago: true, mesNum: 3 },
  { forma: "Cartão", categoria: "Almoço", item: "Restaurante", valor: 36.76, mes: "Março", pago: true, mesNum: 3 },
  // Abril
  { forma: "Boleto", categoria: "Casa", item: "Internet", valor: 100, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Boleto", categoria: "Carro", item: "Seguro", valor: 81, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.43, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Cristal", item: "Veterinário", valor: 255.45, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Cristal", item: "Luto", valor: 118.75, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Viagem", item: "Passagem", valor: 79.68, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.30, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Mercado", valor: 45.91, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Comida", valor: 40, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Mercadinho", valor: 1.49, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Almoço", valor: 21, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Sorvete", valor: 24.44, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Carro", item: "Combustível", valor: 278.78, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Mercado", valor: 22.48, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Celular", item: "Vivo", valor: 53, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Carro", item: "Combustível", valor: 55.04, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Alimentação", item: "Comida", valor: 7.23, mes: "Abril", pago: true, mesNum: 4 },
  { forma: "Cartão", categoria: "Autocuidado", item: "Cabelo", valor: 40, mes: "Abril", pago: true, mesNum: 4 },
  // Maio
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.43, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Alimentação", item: "Almoço", valor: 28.90, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Alimentação", item: "Mercado", valor: 44.41, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Alimentação", item: "Mercadinho", valor: 3.98, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Alimentação", item: "Sorvete", valor: 29.44, mes: "Maio", pago: false, mesNum: 5 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Maio", pago: false, mesNum: 5 },
  // Junho
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 159.10, mes: "Junho", pago: false, mesNum: 6 },
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Junho", pago: false, mesNum: 6 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Junho", pago: false, mesNum: 6 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Junho", pago: false, mesNum: 6 },
  // Julho
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Julho", pago: false, mesNum: 7 },
  { forma: "Cartão", categoria: "Carro", item: "Manutenção", valor: 89.30, mes: "Julho", pago: false, mesNum: 7 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Julho", pago: false, mesNum: 7 },
  // Agosto
  { forma: "Cartão", categoria: "Cartão", item: "Anuidade", valor: 20, mes: "Agosto", pago: false, mesNum: 8 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Agosto", pago: false, mesNum: 8 },
  // Setembro-Dezembro
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Setembro", pago: false, mesNum: 9 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Outubro", pago: false, mesNum: 10 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Novembro", pago: false, mesNum: 11 },
  { forma: "Cartão", categoria: "Faculdade", item: "Mensalidade", valor: 223.03, mes: "Dezembro", pago: false, mesNum: 12 },
];

export const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
