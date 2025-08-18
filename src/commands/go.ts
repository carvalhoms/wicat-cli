import chalk from 'chalk';
import enquirer from 'enquirer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import { 
  GoCommand, 
  loadGoCommands, 
  addGoCommand, 
  getGoCommand, 
  removeGoCommand 
} from '../utils/goConfig.js';

const { prompt } = enquirer;

async function writeCommandToTerminal(command: string): Promise<void> {
  console.log(chalk.blue('💡 Comando pronto para executar:'));
  console.log(chalk.green(`${command}`));
  
  // Copia para clipboard
  try {
    await clipboardy.write(command);
    console.log(chalk.yellow('📋 Comando copiado para área de transferência!'));
    console.log(chalk.gray('   Cole com Cmd+V (Mac) ou Ctrl+V (Windows/Linux)'));
  } catch (error) {
    console.log(chalk.gray('   Digite o comando manualmente'));
  }
}

export async function executeGo(stackName?: string, shouldExec?: boolean, getPath?: boolean, getExec?: boolean): Promise<void> {
  if (!stackName) {
    console.log(chalk.red('❌ Erro: Nome da stack é obrigatório'));
    console.log(chalk.gray('📝 Exemplo: wicat go wicat-web -e'));
    return;
  }

  const command = getGoCommand(stackName);
  
  if (!command) {
    console.log(chalk.red(`❌ Stack "${stackName}" não encontrada`));
    console.log(chalk.blue('💡 Use "wicat go list" para ver stacks disponíveis'));
    console.log(chalk.blue('💡 Use "wicat go add" para criar uma nova stack'));
    return;
  }

  // Verifica se o caminho existe
  if (!fs.existsSync(command.path)) {
    console.log(chalk.red(`❌ Caminho não encontrado: ${command.path}`));
    console.log(chalk.yellow('💡 Use "wicat go edit" para corrigir o caminho'));
    return;
  }

  // Flags especiais para o wrapper script
  if (getPath) {
    console.log(command.path);
    return;
  }

  if (getExec) {
    console.log(command.execCommand || '');
    return;
  }

  console.log(chalk.cyan('🚀 Wicat Go - Navegação Rápida'));
  console.log(chalk.blue(`📁 Stack: ${command.name}`));
  console.log(chalk.blue(`📂 Caminho: ${command.path}`));
  
  if (shouldExec && command.execCommand) {
    console.log(chalk.blue(`⚡ Comando: ${command.execCommand}`));
    console.log('');
    
    // Navega para o diretório e executa o comando
    console.log(chalk.green('🏃‍♂️ Executando comando...'));
    
    const child = spawn(command.execCommand, {
      cwd: command.path,
      shell: true,
      stdio: 'inherit'
    });
    
    child.on('error', (error) => {
      console.log(chalk.red(`❌ Erro ao executar comando: ${error.message}`));
    });
    
  } else if (shouldExec && !command.execCommand) {
    console.log(chalk.yellow('⚠️  Nenhum comando de execução configurado para esta stack'));
    console.log('');
    await writeCommandToTerminal(`cd "${command.path}"`);
    
  } else {
    console.log('');
    await writeCommandToTerminal(`cd "${command.path}"`);
    
    if (command.execCommand) {
      console.log('');
      console.log(chalk.gray('💡 Para executar também use:'));
      console.log(chalk.white(`wicat go ${stackName} -e`));
    }
  }
}

export async function addGoStack(): Promise<void> {
  console.log(chalk.cyan('🚀 Wicat Go - Adicionar Nova Stack'));
  console.log('');

  try {
    const answers = await prompt([
      {
        type: 'input',
        name: 'name',
        message: '📝 Nome da stack:',
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Nome é obrigatório';
          }
          if (value.includes(' ')) {
            return 'Nome não pode conter espaços';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'path',
        message: '📂 Caminho do projeto:',
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Caminho é obrigatório';
          }
          
          const expandedPath = value.startsWith('~') 
            ? path.join(process.env.HOME || '', value.slice(1))
            : path.resolve(value);
            
          if (!fs.existsSync(expandedPath)) {
            return `Caminho não existe: ${expandedPath}`;
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'execCommand',
        message: '⚡ Comando para executar (opcional):',
        initial: ''
      }
    ]) as { name: string; path: string; execCommand: string };

    // Expande ~ para home directory
    const expandedPath = answers.path.startsWith('~') 
      ? path.join(process.env.HOME || '', answers.path.slice(1))
      : path.resolve(answers.path);

    const command: GoCommand = {
      name: answers.name,
      path: expandedPath,
      execCommand: answers.execCommand.trim()
    };

    addGoCommand(command);
    
    console.log('');
    console.log(chalk.green('✅ Stack adicionada com sucesso!'));
    console.log(chalk.blue(`📁 Nome: ${command.name}`));
    console.log(chalk.blue(`📂 Caminho: ${command.path}`));
    if (command.execCommand) {
      console.log(chalk.blue(`⚡ Comando: ${command.execCommand}`));
    }
    
  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}

export async function listGoStacks(): Promise<void> {
  const commands = loadGoCommands();
  
  console.log(chalk.cyan('🚀 Wicat Go - Stacks Disponíveis'));
  console.log('');
  
  if (commands.length === 0) {
    console.log(chalk.yellow('📭 Nenhuma stack configurada'));
    console.log(chalk.blue('💡 Use "wicat go add" para criar uma nova stack'));
    return;
  }
  
  commands.forEach((cmd, index) => {
    console.log(chalk.blue(`${index + 1}. ${chalk.bold(cmd.name)}`));
    console.log(chalk.gray(`   📂 ${cmd.path}`));
    if (cmd.execCommand) {
      console.log(chalk.gray(`   ⚡ ${cmd.execCommand}`));
    }
    console.log('');
  });
  
  console.log(chalk.green(`📊 Total: ${commands.length} stack(s)`));
}

export async function editGoStack(stackName: string): Promise<void> {
  if (!stackName) {
    console.log(chalk.red('❌ Erro: Nome da stack é obrigatório'));
    console.log(chalk.gray('📝 Exemplo: wicat go edit wicat-web'));
    return;
  }

  const existingCommand = getGoCommand(stackName);
  
  if (!existingCommand) {
    console.log(chalk.red(`❌ Stack "${stackName}" não encontrada`));
    console.log(chalk.blue('💡 Use "wicat go list" para ver stacks disponíveis'));
    return;
  }

  console.log(chalk.cyan(`🚀 Wicat Go - Editar Stack "${stackName}"`));
  console.log('');

  try {
    const answers = await prompt([
      {
        type: 'input',
        name: 'name',
        message: '📝 Nome da stack:',
        initial: existingCommand.name,
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Nome é obrigatório';
          }
          if (value.includes(' ')) {
            return 'Nome não pode conter espaços';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'path',
        message: '📂 Caminho do projeto:',
        initial: existingCommand.path,
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Caminho é obrigatório';
          }
          
          const expandedPath = value.startsWith('~') 
            ? path.join(process.env.HOME || '', value.slice(1))
            : path.resolve(value);
            
          if (!fs.existsSync(expandedPath)) {
            return `Caminho não existe: ${expandedPath}`;
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'execCommand',
        message: '⚡ Comando para executar (opcional):',
        initial: existingCommand.execCommand || ''
      }
    ]) as { name: string; path: string; execCommand: string };

    // Se o nome mudou, remove o comando antigo
    if (answers.name !== existingCommand.name) {
      removeGoCommand(existingCommand.name);
    }

    // Expande ~ para home directory
    const expandedPath = answers.path.startsWith('~') 
      ? path.join(process.env.HOME || '', answers.path.slice(1))
      : path.resolve(answers.path);

    const command: GoCommand = {
      name: answers.name,
      path: expandedPath,
      execCommand: answers.execCommand.trim()
    };

    addGoCommand(command);
    
    console.log('');
    console.log(chalk.green('✅ Stack atualizada com sucesso!'));
    console.log(chalk.blue(`📁 Nome: ${command.name}`));
    console.log(chalk.blue(`📂 Caminho: ${command.path}`));
    if (command.execCommand) {
      console.log(chalk.blue(`⚡ Comando: ${command.execCommand}`));
    }
    
  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}
