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

# Sistema de navegação Go
wicat go add              # Adicionar nova stack
wicat go list             # Listar stacks
wicat go wicat-web        # Mostrar como navegar
wicat go wicat-web -e     # Mostrar como navegar e executar
```

### Navegação Automática (Recomendado)

Para navegação real do terminal, adicione esta função ao seu `~/.zshrc` ou `~/.bashrc`:

```bash
# Copie o conteúdo de install/shell-function.sh
source <(cat install/shell-function.sh)

# Ou adicione manualmente:
function wgo() {
  if [ -z "$1" ]; then
    wicat go
    return
  fi
  
  local path_result
  path_result=$(wicat go "$1" --get-path 2>/dev/null)
  
  if [ $? -eq 0 ] && [ -n "$path_result" ]; then
    echo "🚀 Navegando para: $path_result"
    cd "$path_result"
    
    if [ "$2" = "-e" ]; then
      local exec_result
      exec_result=$(wicat go "$1" --get-exec 2>/dev/null)
      if [ -n "$exec_result" ]; then
        echo "⚡ Executando: $exec_result"
        eval "$exec_result"
      fi
    fi
  else
    wicat go "$1" "$2"
  fi
}
```

**Uso da função:**
```bash
wgo wicat-web       # Navega para o projeto
wgo wicat-web -e    # Navega e executa comando
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
