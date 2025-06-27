# Sistema de Gestão de Contas Domésticas

Um sistema moderno e intuitivo para gerenciar contas e despesas domésticas, otimizado para dispositivos móveis.

## 🚀 Características

- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Multi-usuário**: Suporte para múltiplos usuários (você e sua esposa)
- **Gestão Completa**: Adicionar, editar e excluir contas
- **Relatórios**: Resumos e previsões de gastos
- **Categorização**: Organize suas contas por categorias
- **Design Moderno**: Interface limpa e intuitiva

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Ícones**: Lucide React
- **Build**: Vite
- **Containerização**: Docker + Docker Compose

## 🏃‍♂️ Como Executar

### Com Docker (Recomendado)

#### Produção
```bash
# Construir e executar
docker-compose up --build

# Acessar em http://localhost:3000
```

#### Desenvolvimento
```bash
# Executar em modo desenvolvimento
docker-compose --profile dev up --build

# Acessar em http://localhost:5173
```

### Sem Docker

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Construir para produção
npm run build
npm run preview
```

## 📱 Funcionalidades

### Dashboard
- Resumo financeiro geral
- Total de gastos, valores pagos e pendentes
- Previsão mensal de gastos
- Gráfico de gastos por categoria

### Gestão de Contas
- Adicionar novas contas com categorias
- Editar contas existentes
- Marcar contas como pagas
- Filtrar e buscar contas
- Separação por status (vencidas, próximas, pagas)

### Categorias Disponíveis
- Moradia
- Utilidades (luz, água, gás)
- Internet
- Alimentação
- Transporte
- Saúde
- Entretenimento
- Compras
- Educação
- Outros

## 🎨 Paleta de Cores

O sistema utiliza uma paleta de cores harmoniosa:

- **Tea Green** (#d1f0b1): Cor principal para ações positivas
- **Celadon** (#b6cb9e): Cor secundária para elementos de apoio
- **Cambridge Blue** (#92b4a7): Cor para informações neutras
- **Taupe Gray** (#8c8a93): Cor para textos e elementos secundários
- **Chinese Violet** (#81667a): Cor para alertas e elementos de destaque

## 💾 Armazenamento

Os dados são armazenados localmente no navegador usando localStorage. Em futuras versões, será possível integrar com um backend para sincronização entre dispositivos.

## 🔧 Configuração

### Multi-usuário
O sistema suporta dois usuários por padrão:
- Usuário 1: "Você"
- Usuário 2: "Esposa"

Cada usuário pode criar e gerenciar suas próprias contas, com visão compartilhada dos dados.

### Contas Recorrentes
É possível marcar contas como recorrentes (mensais, semanais ou anuais) para facilitar o planejamento financeiro.

## 📊 Relatórios

- Resumo geral de gastos
- Distribuição por categorias
- Previsão de gastos mensais baseada em contas recorrentes
- Identificação de contas vencidas

## 🚀 Próximas Funcionalidades

- Calendário de vencimentos
- Relatórios detalhados por período
- Notificações de vencimento
- Exportação de dados
- Sincronização na nuvem
- Gráficos de tendências

## 📄 Licença

Este projeto é de uso pessoal.