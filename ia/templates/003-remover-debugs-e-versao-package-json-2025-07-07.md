# Plano de Ação: Remover Debugs e Exibir Versão do Package.json

## Contexto
Este plano de ação detalha as etapas para implementar as melhorias solicitadas na tarefa `002-retirada-debugs.md`, focando na remoção de elementos de debug e transações recentes da página de Resumo Financeiro, e na exibição da versão do `package.json` na página de Configurações.

## Objetivo
- Remover os cards de transações recentes e debug da página de Resumo Financeiro (`src/components/Dashboard.tsx`).
- Na página de Configurações (`src/components/Settings.tsx`), exibir a versão do `package.json`.

## Etapas Detalhadas

### Parte 1: Remover Cards de Transações Recentes e Debug (Dashboard)

1.  **Localizar o arquivo:**
    *   `src/components/Dashboard.tsx`

2.  **Identificar e remover o bloco "Recent Transactions":**
    *   No arquivo `Dashboard.tsx`, localizar o bloco JSX que começa com `<!-- Recent Transactions - NOT CLICKABLE -->` e o condicional `{transactionsForSelectedMonth.length > 0 && (...) }`.
    *   Remover todo este bloco de código.

3.  **Identificar e remover o bloco "ENHANCED DEBUG INFO":**
    *   No arquivo `Dashboard.tsx`, localizar o bloco JSX que começa com `<!-- ENHANCED DEBUG INFO -->` e o `div` subsequente.
    *   Remover todo este bloco de código.

### Parte 2: Exibir Versão do Package.json (Settings)

1.  **Localizar o arquivo:**
    *   `src/components/Settings.tsx`

2.  **Ler a versão do `package.json`:**
    *   Será necessário ler o arquivo `package.json` para obter a propriedade `version`. Isso pode ser feito no momento da build ou, se o React permitir, importando diretamente (embora não seja o ideal para produção). Para este caso, vamos considerar que a versão será injetada ou lida de forma segura. Uma abordagem comum em projetos React/Vite é expor variáveis de ambiente no `vite.config.ts` ou ler o `package.json` diretamente no processo de build e injetar a versão.

3.  **Adicionar exibição da versão em `Settings.tsx`:**
    *   No arquivo `Settings.tsx`, adicionar um elemento de texto (e.g., `<p>` ou `<span>`) que exiba a versão lida do `package.json`.
    *   Exemplo: `Versão: {APP_VERSION}` (onde `APP_VERSION` seria a variável contendo a versão).

### Verificação

1.  **Build e Execução Local:**
    *   Executar o comando `docker-compose up --build` para reconstruir as imagens e iniciar os serviços.

2.  **Verificação no Navegador:**
    *   Acessar a página de Resumo Financeiro e confirmar que os cards de "Transações Recentes" e "DEBUG" não estão mais visíveis.
    *   Acessar a página de Configurações e verificar se a versão do aplicativo está sendo exibida corretamente.

## Critérios de Aceitação
- Os cards de transações recentes e debug foram removidos da página de Resumo Financeiro.
- A versão do `package.json` é exibida corretamente na página de Configurações.
- O projeto continua funcional e testável localmente via Docker.
- O código permanece limpo e modular.
