## Plano de Ação: Ajuste no Cálculo de Receitas (isPaid=true)

### Objetivo:
Corrigir o cálculo de receitas em toda a aplicação para incluir apenas transações marcadas como `isPaid=true`, replicando o comportamento já existente no `Dashboard.tsx`.

### Arquivos Afetados e Alterações Propostas:

1.  **`src/components/Calendar.tsx`**
    *   **Alteração:** Modificar o cálculo da variável `monthlyIncome` para filtrar transações de tipo `income` que também tenham `isPaid` como `true`.
    *   **Linha/Contexto:** `monthlyIncome = currentMonthEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);`
    *   **Para:** `monthlyIncome = currentMonthEvents.filter(e => e.type === 'income' && e.isPaid).reduce((sum, e) => sum + e.amount, 0);`

2.  **`src/utils/helpers.ts`**
    *   **Função `getMonthlyData`:**
        *   **Alteração:** Na lógica de agregação de receitas, adicionar a condição `&& transaction.isPaid` ao filtro.
        *   **Contexto:** Dentro da função `getMonthlyData`, na parte que processa as transações para calcular a receita mensal.
    *   **Função `getCategoryData`:**
        *   **Verificação:** Confirmar se esta função é utilizada para categorização de receitas. Se sim, ajustar a lógica de filtro para receitas para incluir `isPaid=true`. (Prioridade secundária, foco principal é `getMonthlyData` para relatórios de receita).

3.  **`src/components/TransactionList.tsx`**
    *   **Alteração:** Na seção onde `type === 'income'`, modificar o cálculo da variável `total` para incluir um filtro por `isPaid=true`.
    *   **Contexto:** `const total = sortedTransactions.reduce((sum, t) => sum + t.amount, 0);`
    *   **Para:** `const total = sortedTransactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);`

4.  **`src/hooks/useFinancialData.ts`**
    *   **Função `calculateMonthlyBalances`:**
        *   **Alteração:** Dentro do loop que itera sobre as transações para construir o `balancesMap`, na condição que verifica `transaction.type === 'income'`, adicionar `&& transaction.isPaid`.
        *   **Contexto:** `if (transaction.type === 'income') { currentMonthData.income += transaction.amount; }`
        *   **Para:** `if (transaction.type === 'income' && transaction.isPaid) { currentMonthData.income += transaction.amount; }`

### Passos de Verificação e Teste:

1.  Executar `docker-compose up --build` para reconstruir e iniciar a aplicação.
2.  Navegar para as páginas de Calendário, Relatórios e Receitas.
3.  Adicionar novas transações de receita (algumas marcadas como pagas, outras não).
4.  Verificar se os totais de receita e os gráficos nessas páginas refletem apenas as transações de receita que estão marcadas como `isPaid=true`.
5.  Alterar o status `isPaid` de receitas existentes e observar se os cálculos são atualizados corretamente em todas as visualizações.