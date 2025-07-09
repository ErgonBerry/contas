## Plano: Implementar Switch de Paleta de Cores

### 1. Frontend - UI e Gerenciamento de Estado:
*   Adicionar um componente de toggle switch (por exemplo, em `src/components/Settings.tsx` ou `src/components/Header.tsx`).
*   Utilizar a Context API do React ou uma biblioteca de gerenciamento de estado para gerenciar o estado atual do tema/paleta de cores em toda a aplicação.
*   Armazenar a preferência do usuário (cores originais vs. aleatórias) no `localStorage` para persistência.

### 2. Frontend - Lógica da Paleta de Cores:
*   **Cores Originais:** Definir um conjunto de variáveis CSS para o esquema de cores padrão da aplicação.
*   **Cores Aleatórias:**
    *   Investigar a API do `coolors.co` para buscar paletas, ou criar um array local de paletas de cores predefinidas (por exemplo, 5-10 paletas diversas).
    *   Implementar uma função para selecionar aleatoriamente uma paleta entre as opções disponíveis.
    *   Quando o switch estiver LIGADO, aplicar as cores da paleta aleatória selecionada como variáveis CSS.
    *   Quando o switch estiver DESLIGADO, reverter para as variáveis de cores originais.

### 3. Estilização:
*   Modificar `src/index.css` ou criar um novo arquivo CSS (por exemplo, `src/styles/themes.css`) para definir variáveis CSS para as cores.
*   Garantir que todos os componentes utilizem essas variáveis CSS para sua estilização, permitindo mudanças dinâmicas de tema.

### 4. Integração e Verificação:
*   Integrar o switch de cores na interface do usuário da aplicação.
*   Testar a funcionalidade:
    *   Alternar LIGAR/DESLIGAR.
    *   Verificar as mudanças de cores aleatórias quando LIGADO.
    *   Verificar o retorno às cores originais quando DESLIGADO.
    *   Verificar a persistência entre recarregamentos de página.
    *   Garantir a responsividade.
*   Executar `docker-compose up --build` para testar localmente.
