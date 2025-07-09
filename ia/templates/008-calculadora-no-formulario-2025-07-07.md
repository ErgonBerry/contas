## Plano de Ação: Calculadora Embutida no Formulário de Transação

### Objetivo:
Integrar uma calculadora simples (apenas adição) ao campo de entrada de valor (`amount`) no formulário de transação, permitindo que o usuário some múltiplos valores dinamicamente antes de preencher o campo final.

### Arquivos Afetados e Alterações Propostas:

1.  **`src/components/TransactionForm.tsx`**
    *   Este será o principal arquivo a ser modificado, pois a funcionalidade é puramente de UI/UX no frontend.

    *   **1.1. Gerenciamento de Estado:**
        *   Adicionar novos estados para controlar a visibilidade da calculadora e seus valores internos:
            ```typescript
            const [showCalculator, setShowCalculator] = useState(false);
            const [calculatorInput, setCalculatorInput] = useState('');
            const [currentSum, setCurrentSum] = useState(0);
            ```
        *   No `useEffect` que inicializa o `formData` (para novas transações ou replicação), garantir que `currentSum` e `calculatorInput` sejam resetados:
            ```typescript
            useEffect(() => {
              // ... lógica existente para transaction e replicateTransaction ...
              else {
                setFormData({
                  // ... campos existentes ...
                  amount: '', // Garante que o campo de valor esteja vazio para nova entrada
                });
                setCurrentSum(0); // Resetar a soma da calculadora
                setCalculatorInput(''); // Resetar o input da calculadora
              }
            }, [transaction, replicateTransaction, type]);
            ```

    *   **1.2. Integração da UI:**
        *   Localizar o `div` que contém o `label` e o `input` do campo `amount`.
        *   Adicionar um botão (ex: com um ícone de calculadora ou `Plus`) ao lado do campo `amount`. Este botão será responsável por alternar a visibilidade da calculadora (`setShowCalculator(!showCalculator)`).
        *   Condicionalmente renderizar a interface da calculadora logo abaixo do campo `amount` quando `showCalculator` for `true`.

    *   **1.3. Interface da Calculadora (Renderização Condicional):**
        *   A interface da calculadora deve ser simples e conter:
            *   Um campo de entrada (`input type="number"`) para `calculatorInput`.
            *   Um botão "Adicionar" (`+`) que, ao ser clicado, adiciona o valor de `calculatorInput` a `currentSum`.
            *   Um display para mostrar o `currentSum` atual.
            *   Um botão "Concluir" que, ao ser clicado, transfere o `currentSum` para o `formData.amount`, reseta os estados da calculadora e a esconde.

    *   **1.4. Lógica da Calculadora (Funções):**
        *   `handleCalculatorInputChange(e: React.ChangeEvent<HTMLInputElement>)`: Atualiza o estado `calculatorInput` com o valor digitado.
        *   `handleAddNumber()`:
            *   Converte `calculatorInput` para um número (`parseFloat`).
            *   Verifica se é um número válido (`!isNaN`).
            *   Adiciona o número a `currentSum`.
            *   Limpa `calculatorInput`.
        *   `handleApplyCalculation()`:
            *   Atualiza `formData.amount` com `currentSum.toString()`.
            *   Reseta `currentSum` para `0`.
            *   Reseta `calculatorInput` para `''`.
            *   Define `showCalculator` para `false`.

### Passos de Verificação e Teste:

1.  **Construir e Iniciar a Aplicação:**
    *   Execute `docker-compose up --build` no terminal para garantir que todas as alterações sejam compiladas e a aplicação seja iniciada corretamente.

2.  **Testar a Calculadora:**
    *   Navegue para as páginas de "Despesas" (`/expenses`) ou "Receitas" (`/income`).
    *   Clique no botão "Adicionar" (`+`) para abrir o formulário de transação.
    *   Localize o campo "Valor (R$)".
    *   **Abrir Calculadora:** Clique no novo ícone/botão da calculadora ao lado do campo de valor.
        *   **Expectativa:** A interface da calculadora deve aparecer.
    *   **Realizar Adições:**
        *   Digite um número no campo de entrada da calculadora (ex: `10`).
        *   Clique no botão "Adicionar".
        *   **Expectativa:** O `currentSum` deve ser atualizado (ex: `10`). O campo de entrada da calculadora deve ser limpo.
        *   Repita com outros números (ex: `5`, `2.5`).
        *   **Expectativa:** O `currentSum` deve refletir a soma total (ex: `17.5`).
    *   **Aplicar Resultado:** Clique no botão "Concluir".
        *   **Expectativa:** A interface da calculadora deve desaparecer.
        *   **Expectativa:** O campo "Valor (R$)" do formulário principal deve ser preenchido com o `currentSum` final (ex: `17.5`).
    *   **Testar Entradas Inválidas:** Tente digitar texto no campo de entrada da calculadora e clique em "Adicionar".
        *   **Expectativa:** O `currentSum` não deve ser alterado, e a aplicação não deve quebrar.

3.  **Verificar Comportamento Existente:**
    *   Certifique-se de que a adição, edição e replicação de transações ainda funcionam corretamente, sem interferência da nova calculadora.
    *   Verifique a responsividade da interface da calculadora em diferentes tamanhos de tela.

### Saída Esperada:

*   O código da calculadora estará integrado no frontend.
*   A funcionalidade será testável localmente via Docker.
*   O usuário poderá somar valores antes de preencher o campo de valor da transação, melhorando a usabilidade.