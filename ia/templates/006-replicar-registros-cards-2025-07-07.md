## Plano de Ação: Replicar Registros em Cards

### Objetivo:
Implementar a funcionalidade de replicar um registro de transação (receita ou despesa) ao pressionar e segurar um card, preenchendo automaticamente o formulário de nova transação com os dados do card selecionado. Isso agilizará a criação de registros semelhantes.

### Arquivos Afetados e Alterações Propostas:

1.  **`src/components/TransactionList.tsx`**
    *   **Adicionar Estado para Replicação:**
        *   Introduzir um novo estado para armazenar a transação a ser replicada: `const [transactionToReplicate, setTransactionToReplicate] = useState<Transaction | null>(null);`
    *   **Manipuladores de Evento (Press and Hold):**
        *   Para cada card de transação, adicionar os atributos `onMouseDown`, `onMouseUp`, `onMouseLeave` (para desktop) e `onTouchStart`, `onTouchEnd`, `onTouchCancel` (para mobile).
        *   Implementar uma lógica de `setTimeout` para detectar o "press and hold" (ex: 500ms).
        *   `handleMouseDown` / `handleTouchStart`: Iniciar um timer. Se o timer expirar antes de `mouseUp`/`touchEnd`, acionar a replicação.
        *   `handleMouseUp` / `handleTouchEnd` / `handleMouseLeave` / `handleTouchCancel`: Limpar o timer.
        *   Quando o "press and hold" é detectado, chamar `setTransactionToReplicate(transaction)` com os dados do card e `setShowForm(true)`.
    *   **Passar Dados para o Formulário:**
        *   Modificar a renderização do `TransactionForm` para passar a nova prop:
            ```typescript
            <TransactionForm
              type={type}
              transaction={editingTransaction}
              replicateTransaction={transactionToReplicate} // Nova prop
              onSubmit={handleSubmit}
              onClose={handleCloseForm}
            />
            ```
    *   **Resetar Estado:**
        *   Na função `handleCloseForm`, adicionar `setTransactionToReplicate(null);` para garantir que o estado seja limpo após o formulário ser fechado.

2.  **`src/components/TransactionForm.tsx`**
    *   **Receber Prop de Replicação:**
        *   Adicionar a nova prop à interface `TransactionFormProps`: `replicateTransaction?: Transaction | null;`
    *   **Lógica de Preenchimento Inicial:**
        *   No `useEffect` que inicializa o formulário (ou na inicialização do estado `formData`), adicionar uma condição para verificar `replicateTransaction`.
        *   Se `replicateTransaction` estiver presente:
            *   Copiar `description`, `amount`, `category`, `type`, `recurrence`, `dueDate` (se aplicável) do `replicateTransaction`.
            *   Definir `isPaid` como `false` (para uma nova transação).
            *   Definir `date` como a data atual (ou o primeiro dia do próximo mês, se preferir uma replicação para o futuro). Para este plano, usaremos a data atual.
            *   `id` e `createdAt` devem ser omitidos ou definidos como `undefined` para garantir que uma nova transação seja criada.
        *   Exemplo de ajuste no `useEffect` (simplificado):
            ```typescript
            useEffect(() => {
              if (transaction) {
                // Lógica existente para edição
              } else if (replicateTransaction) {
                setFormData({
                  description: replicateTransaction.description,
                  amount: replicateTransaction.amount,
                  category: replicateTransaction.category,
                  type: replicateTransaction.type,
                  date: getCurrentBrazilDate().toISOString().split('T')[0], // Data atual
                  isPaid: false, // Nova transação não paga
                  recurrence: replicateTransaction.recurrence,
                  dueDate: replicateTransaction.dueDate ? getCurrentBrazilDate().toISOString().split('T')[0] : undefined, // Data atual para vencimento
                });
              } else {
                // Lógica existente para nova transação vazia
              }
            }, [transaction, replicateTransaction]);
            ```

### Passos de Verificação e Teste:

1.  **Construir e Iniciar a Aplicação:**
    *   Execute `docker-compose up --build` no terminal para garantir que todas as alterações sejam compiladas e a aplicação seja iniciada corretamente.

2.  **Testar a Funcionalidade de Replicação:**
    *   Navegue para as páginas de "Despesas" (`/expenses`) e "Receitas" (`/income`).
    *   **Pressionar e Segurar:** Selecione um card de transação existente e pressione e segure (clique e segure o botão do mouse ou toque e segure na tela de um dispositivo móvel) por aproximadamente 1 segundo.
        *   **Expectativa:** O modal do formulário de transação deve aparecer.
        *   **Expectativa:** Os campos do formulário (`descrição`, `valor`, `categoria`, `tipo`, `recorrência`, `data de vencimento` - se aplicável) devem estar preenchidos com os dados do card original.
        *   **Expectativa:** O campo `isPaid` deve estar desmarcado (ou `false`).
        *   **Expectativa:** O campo `date` (e `dueDate` se for despesa) deve ser a data atual.
    *   **Submeter Formulário Replicado:**
        *   Com o formulário preenchido, você pode fazer pequenas alterações (opcional) ou submeter diretamente.
        *   **Expectativa:** Uma nova transação deve ser criada e aparecer na lista, sem afetar a transação original.
    *   **Testar Cancelamento:**
        *   Pressione e segure um card, mas solte rapidamente antes que o formulário apareça.
        *   **Expectativa:** O formulário não deve aparecer.

3.  **Verificar Comportamento Existente:**
    *   Certifique-se de que o clique normal nos cards ainda abre o formulário para edição da transação original.
    *   Certifique-se de que o botão "Adicionar" (`+`) ainda abre um formulário vazio para uma nova transação.

### Saída Esperada:

*   O código da funcionalidade de replicação estará integrado no frontend.
*   A funcionalidade será testável localmente via Docker.
*   O formulário de transação será preenchido automaticamente ao replicar, agilizando o processo para o usuário.