# Wicat CLI

CLI tools for Wicat development and Docker management.

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

# Sistema Docker - Comandos agrupados por tipo
wicat docker                    # Seletor interativo
wicat docker add                # Adicionar novo comando
wicat docker list               # Listar comandos
wicat docker edit <comando>     # Editar comando
wicat docker remove <comando>   # Remover comando
```

## Sistema Docker

### Tipos de Comando

Os comandos Docker são organizados por categoria:

- 🟢 **UP** - Iniciar serviços
- 🔄 **RESET** - Reiniciar serviços
- 🟡 **STOP** - Parar serviços
- 🔴 **REMOVE** - Remover serviços (pede confirmação)

### Sistema de Atalhos

Comandos podem ter atalhos opcionais para execução direta:

```bash
# Criar comando com atalho
wicat d add
🔗 Atalho (opcional - ex: rw, start, stop): wr

# Usar atalho direto (muito mais rápido!)
wicat d wr              # Executa comando diretamente

# Continuar usando seletor
wicat d                 # Menu interativo
```

### Comandos Pré-configurados

Baseados nos scripts do `wicat-dev-compose/package.json`:

#### UP (Iniciar):
```bash
yarn wicat:dev           # Iniciar Wicat completo
yarn wicat-staff:dev     # Iniciar Wicat Staff
```

#### RESET (Reiniciar):
```bash
yarn wicat:reset         # Restart todos containers Wicat
yarn wicat-core:reset    # Restart apenas wicat-core
yarn wicat-web:reset     # Restart apenas wicat-web
yarn wicat-nginx:reset   # Restart apenas nginx
```

#### STOP (Parar):
```bash
yarn wicat:stop          # Parar Wicat
yarn wicat-staff:stop    # Parar Wicat Staff
```

#### REMOVE (Remover):
```bash
yarn wicat:remove        # Remove containers, imagens, volumes
yarn wicat-staff:remove  # Remove Staff completo
```

**Exemplo com atalhos:**
```bash
wicat d wu              # UP: Iniciar Wicat (atalho para wicat:dev)
wicat d wr              # RESET: Restart wicat-web (atalho para wicat-web:reset)
```

### Fluxo de Desenvolvimento

```bash
# 1. Subir ambiente
wicat d wu                    # Atalho rápido (ou wicat d → selecionar UP)

# 2. Instalar pacote na IDE (localmente)
cd wicat-dev-source/wicat-web
yarn add express

# 3. Restart container para carregar novo pacote
wicat d wr                    # Atalho rápido (ou wicat d → selecionar wicat-web-reset)

# 4. Continuar desenvolvimento
```

### Confirmação de Segurança

Comandos do tipo **REMOVE** exigem confirmação:
```bash
🔥 Digite "remove" para confirmar a execução:
```

## Development

```bash
# Executar em modo desenvolvimento
yarn dev

# Build do projeto
yarn build

# Executar versão compilada
yarn start
```

## Estrutura do Projeto

```
wicat-cli/
├── src/
│   ├── commands/
│   │   ├── docker.ts      # Comando Docker principal
│   │   └── uuids.ts       # Gerador de UUIDs
│   ├── utils/
│   │   └── dockerConfig.ts # Configuração Docker
│   └── index.ts           # Entry point
├── dist/                  # Código compilado
├── package.json          # Configurações do projeto
└── README.md             # Documentação
```

## Configuração

Comandos Docker são salvos em: `~/.wicat-cli/docker-commands.json`

Exemplo de configuração:
```json
[
  {
    "name": "wicat-fullstack",
    "type": "UP",
    "command": "yarn --cwd /path/to/wicat-dev-compose wicat:dev",
    "shortcut": "wu"
  },
  {
    "name": "wicat-web-reset",
    "type": "RESET",
    "command": "yarn --cwd /path/to/wicat-dev-compose wicat-web:reset",
    "shortcut": "wr"
  }
]
```

### Aliases Disponíveis

```bash
wicat d         # Alias para wicat docker
wicat u         # Alias para wicat uuids

# Atalhos personalizados (exemplos configurados)
wicat d wu      # Iniciar Wicat completo
wicat d wr      # Restart wicat-web
```
