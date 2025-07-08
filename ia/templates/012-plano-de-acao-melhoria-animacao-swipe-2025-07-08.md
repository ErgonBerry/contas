
# Plano de Ação: Melhoria da Animação de Swipe e Correção de Bug

## 1. Análise do Código Existente

- **Analisar `src/components/SwipeableRoutes.tsx`**: Entender como o componente `SwipeableRoutes` está implementando a funcionalidade de swipe, quais bibliotecas ou lógicas customizadas estão sendo usadas para detecção de gestos e transição de rotas.
- **Analisar CSS/Estilos relacionados**: Verificar se há estilos CSS (`src/index.css` ou outros arquivos de estilo) que afetam a animação de transição das rotas ou o comportamento do swipe.
- **Identificar a causa do problema na página de Metas (`/goals`)**: Investigar por que o swipe para de funcionar especificamente nesta rota. Pode ser um problema de re-renderização, um componente que consome eventos de toque, ou uma condição específica da rota que desabilita o swipe.

## 2. Implementação

- **Melhoria da Animação de Swipe**:
    - **Opção 1 (CSS Transitions/Animations)**: Se a implementação atual for baseada em CSS, refinar as propriedades de `transition` ou `animation` para tornar o movimento mais suave e moderno (e.g., `ease-in-out`, `cubic-bezier`).
    - **Opção 2 (Biblioteca de Animação)**: Considerar a integração de uma biblioteca de animação (se ainda não estiver sendo usada e for apropriado para o projeto) como `Framer Motion` ou `React Spring` para um controle mais fino e animações mais complexas e fluidas.
    - **Opção 3 (Lógica Customizada)**: Otimizar a lógica JavaScript que controla a posição e a transição dos elementos durante o swipe para garantir uma experiência mais fluida.
- **Correção do Bug na Página de Metas**:
    - **Depuração**: Usar as ferramentas de desenvolvedor do navegador para inspecionar o DOM e os eventos na página `/goals` durante o swipe.
    - **Verificar Event Listeners**: Assegurar que os event listeners de toque/mouse para o swipe não estão sendo removidos ou bloqueados indevidamente nesta rota.
    - **Conflitos de Componentes**: Investigar se algum componente específico da página de Metas está interferindo com a funcionalidade de swipe (e.g., um componente que captura todos os eventos de toque).
    - **Estado do Componente**: Garantir que o estado interno de `SwipeableRoutes` ou de seus componentes filhos não está sendo resetado ou corrompido ao navegar para `/goals`.

## 3. Testes

- **Teste local**: Executar `docker-compose up --build` para testar a aplicação localmente.
- **Teste de Animação**: Navegar entre as diferentes rotas usando o swipe e observar a suavidade e a qualidade da animação em diversos dispositivos (desktop com emulação mobile, ou dispositivos reais se possível).
- **Teste do Bug de Metas**: Acessar a página `/goals` e verificar se a funcionalidade de swipe está ativa e funcionando corretamente para navegar para as rotas adjacentes.
- **Verificar o console**: Procurar por erros ou avisos no console do navegador durante a navegação e o uso do swipe.
