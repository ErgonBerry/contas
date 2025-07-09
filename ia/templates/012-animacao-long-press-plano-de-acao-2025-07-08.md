## Plano de Ação: Animação de Long Press com Contagem Regressiva

### 🎯 Objetivo:
Implementar uma animação de contagem regressiva de 3 segundos ao realizar um "long press" nos cards de incomes e expenses, antes de abrir a tela de inserção de registro. A lógica atual de abertura da tela não deve ser alterada, apenas a adição da animação.

### 📦 Requisitos Técnicos (Reafirmação):
- Frontend: React + Vite
- Linguagem: JavaScript/TypeScript
- Não alterar a lógica existente de abertura da tela de inserção de registro.

### 📝 Detalhamento do Plano:

1.  **Identificar Componentes Alvo:**
    - Localizar os componentes React responsáveis pela renderização dos cards de "incomes" e "expenses". Provavelmente `TransactionList.tsx` ou componentes filhos que renderizam os itens individuais.

2.  **Implementar Lógica de Long Press:**
    - Utilizar eventos de toque (`onTouchStart`, `onTouchEnd`, `onTouchMove`) ou eventos de mouse (`onMouseDown`, `onMouseUp`, `onMouseLeave`) para detectar o "long press".
    - Um `setTimeout` será usado para iniciar a contagem regressiva após um determinado tempo (e.g., 500ms) de pressionamento. Se o dedo/mouse for liberado antes, o `setTimeout` deve ser cancelado.

3.  **Desenvolver a Contagem Regressiva:**
    - Criar um estado local no componente do card para gerenciar o valor da contagem regressiva (e.g., `countdown: 3, 2, 1, 0`).
    - Usar `setInterval` para decrementar o contador a cada segundo.
    - Limpar o `setInterval` quando a contagem chegar a zero ou se o long press for interrompido.

4.  **Animação Visual da Contagem Regressiva:**
    - Exibir o número da contagem regressiva diretamente sobre o card ou em uma sobreposição visualmente discreta.
    - Adicionar estilos CSS para animar a aparência do contador (e.g., fade-in/fade-out, escala, cor).
    - Considerar o uso de bibliotecas de animação CSS (como `framer-motion` ou `react-spring`) se já estiverem no projeto, ou implementar com CSS puro para manter a leveza. (Verificar `package.json` para libs existentes).

5.  **Integração com a Abertura da Tela de Registro:**
    - Quando a contagem regressiva atingir zero, disparar a função existente que abre a tela de inserção de registro.
    - Garantir que a função de abertura da tela seja chamada apenas uma vez após a contagem regressiva completa.

6.  **Testes Locais:**
    - Executar `docker-compose up --build` para iniciar o ambiente de desenvolvimento.
    - Testar a funcionalidade de long press em diferentes dispositivos/tamanhos de tela (responsividade).
    - Verificar se a contagem regressiva aparece e desaparece corretamente.
    - Assegurar que a tela de registro abre apenas após a contagem regressiva completa.
    - Confirmar que a lógica existente de abertura da tela não foi afetada.

### ✅ Critérios de Aceitação (Reafirmação):
- A animação de contagem regressiva de 3 segundos é exibida no long press.
- A tela de inserção de registro abre somente após a contagem regressiva.
- A lógica original de abertura da tela não foi modificada.
- O código é limpo, modular e segue as convenções do projeto.
- Funcionalidade testada localmente via Docker.

### 🚀 Próximos Passos:
- Após a aprovação deste plano, iniciar a implementação conforme detalhado.
