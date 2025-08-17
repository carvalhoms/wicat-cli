# Wicat CLI

CLI tools for Wicat development.

## Installation

Para instalar localmente (desenvolvimento):

```bash
# Clone o repositório
git clone <your-private-repo>
cd wicat-cli

# Instalar dependências
yarn install

# Build do projeto
yarn build

# Instalar globalmente (link local)
yarn link
```

## Usage

### Comandos disponíveis

```bash
# Exibir ajuda
wicat --help

# Gerar UUIDs (modo interativo)
wicat uuids

# Gerar UUIDs (quantidade específica)
wicat uuids -c 10
```

## Development

```bash
# Executar em modo desenvolvimento
yarn dev uuids

# Build do projeto
yarn build

# Executar versão compilada
yarn start uuids
```

## Estrutura do Projeto

```
wicat-cli/
├── src/           # Código TypeScript
├── dist/          # Código compilado
├── package.json   # Configurações do projeto
└── README.md      # Documentação
```
