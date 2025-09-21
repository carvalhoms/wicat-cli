import chalk from 'chalk';
import enquirer from 'enquirer';
import { spawn } from 'child_process';
import {
  DockerCommand,
  DockerCommandType,
  loadDockerCommands,
  addDockerCommand as saveDockerCommand,
  getDockerCommand,
  removeDockerCommand as deleteDockerCommand
} from '../utils/dockerConfig.js';

const { prompt } = enquirer;

export async function executeDockerInteractive(): Promise<void> {
  const commands = loadDockerCommands();

  console.log(chalk.cyan('🐳 Wicat Docker - Comandos Rápidos'));
  console.log('');

  if (commands.length === 0) {
    console.log(chalk.yellow('📭 Nenhum comando configurado'));
    console.log(chalk.blue('💡 Use "wicat docker add" para criar um novo comando'));
    return;
  }

  try {
    // Agrupar comandos por tipo na ordem correta
    const typeOrder: DockerCommandType[] = ['UP', 'RESET', 'STOP', 'REMOVE'];
    const groupedCommands = commands.reduce((groups, cmd) => {
      if (!groups[cmd.type]) {
        groups[cmd.type] = [];
      }
      groups[cmd.type].push(cmd);
      return groups;
    }, {} as Record<DockerCommandType, DockerCommand[]>);

    // Criar choices organizados por tipo
    const choices: any[] = [];

    typeOrder.forEach(type => {
      if (groupedCommands[type] && groupedCommands[type].length > 0) {
        // Adicionar separador visual para cada grupo
        choices.push({
          name: `separator-${type}`,
          message: chalk.bold(`\n${getTypeIcon(type)} ${type}:`),
          value: 'separator',
          disabled: true
        });

        // Adicionar comandos do grupo
        groupedCommands[type].forEach(cmd => {
          choices.push({
            name: cmd.name,
            message: `  ${chalk.bold(cmd.name)} ${chalk.gray(`⚡ ${cmd.command}`)}`,
            value: cmd.name
          });
        });
      }
    });

    const response = await prompt({
      type: 'select',
      name: 'selectedCommand',
      message: '🐳 Escolha o comando para executar:',
      choices: choices
    }) as { selectedCommand: string };

    const selectedCommand = getDockerCommand(response.selectedCommand);

    if (!selectedCommand) {
      console.log(chalk.red(`❌ Comando "${response.selectedCommand}" não encontrado`));
      return;
    }

    console.log('');
    console.log(chalk.blue(`🐳 Comando: ${selectedCommand.name}`));
    console.log(chalk.blue(`🏷️  Tipo: ${selectedCommand.type}`));
    console.log(chalk.blue(`⚡ Executando: ${selectedCommand.command}`));
    console.log('');

    // Se for comando REMOVE, pedir confirmação
    if (selectedCommand.type === 'REMOVE') {
      console.log(chalk.yellow('⚠️  ATENÇÃO: Este comando irá remover containers, imagens e volumes!'));
      console.log('');

      try {
        const confirmation = await prompt({
          type: 'input',
          name: 'confirmText',
          message: `${chalk.red('🔥 Digite "remove" para confirmar a execução:')}`,
          validate: (value: string) => {
            if (value !== 'remove') {
              return 'Digite exatamente "remove" para confirmar';
            }
            return true;
          }
        }) as { confirmText: string };

        if (confirmation.confirmText !== 'remove') {
          console.log('');
          console.log(chalk.yellow('⚠️  Operação cancelada'));
          return;
        }
      } catch (error) {
        console.log('');
        console.log(chalk.yellow('⚠️  Operação cancelada'));
        return;
      }

      console.log('');
    }

    // Executa comando com feedback completo (seguindo padrão wicat go)
    console.log(chalk.green('🏃‍♂️ Executando comando...'));

    const child = spawn(selectedCommand.command, {
      shell: true,
      stdio: 'inherit'
    });

    child.on('error', (error) => {
      console.log(chalk.red(`❌ Erro ao executar comando: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✨ Done.'));
      } else {
        console.log(chalk.red(`❌ Comando finalizado com código: ${code}`));
      }
    });

  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}

function getTypeIcon(type: DockerCommandType): string {
  switch (type) {
    case 'UP': return '🟢';
    case 'RESET': return '🔄';
    case 'STOP': return '🟡';
    case 'REMOVE': return '🔴';
    default: return '⚫';
  }
}

export async function addDockerCommand(): Promise<void> {
  console.log(chalk.cyan('🐳 Wicat Docker - Adicionar Novo Comando'));
  console.log('');

  try {
    const answers = await prompt([
      {
        type: 'input',
        name: 'name',
        message: '📝 Nome do comando:',
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
        type: 'select',
        name: 'type',
        message: '🏷️  Tipo do comando:',
        choices: [
          { name: 'UP', message: '🟢 UP - Iniciar serviços' },
          { name: 'RESET', message: '🔄 RESET - Reiniciar serviços' },
          { name: 'STOP', message: '🟡 STOP - Parar serviços' },
          { name: 'REMOVE', message: '🔴 REMOVE - Remover serviços' }
        ]
      },
      {
        type: 'input',
        name: 'command',
        message: '⚡ Comando para executar:',
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Comando é obrigatório';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'shortcut',
        message: '🔗 Atalho (opcional - ex: rw, start, stop):',
        initial: '',
        validate: (value: string) => {
          if (value.trim() && value.includes(' ')) {
            return 'Atalho não pode conter espaços';
          }
          return true;
        }
      }
    ]) as { name: string; type: DockerCommandType; command: string; shortcut: string };

    const command: DockerCommand = {
      name: answers.name,
      type: answers.type,
      command: answers.command.trim(),
      shortcut: answers.shortcut.trim() || undefined
    };

    saveDockerCommand(command);

    console.log('');
    console.log(chalk.green('✅ Comando adicionado com sucesso!'));
    console.log(chalk.blue(`📝 Nome: ${command.name}`));
    console.log(chalk.blue(`🏷️  Tipo: ${command.type}`));
    console.log(chalk.blue(`⚡ Comando: ${command.command}`));
    if (command.shortcut) {
      console.log(chalk.blue(`🔗 Atalho: wicat d ${command.shortcut}`));
    }

  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}

export async function listDockerCommands(): Promise<void> {
  const commands = loadDockerCommands();

  console.log(chalk.cyan('🐳 Wicat Docker - Lista de Comandos'));
  console.log('');

  if (commands.length === 0) {
    console.log(chalk.yellow('📭 Nenhum comando configurado'));
    console.log(chalk.blue('💡 Use "wicat docker add" para criar um novo comando'));
    return;
  }

  // Agrupar comandos por tipo
  const groupedCommands = commands.reduce((groups, cmd) => {
    if (!groups[cmd.type]) {
      groups[cmd.type] = [];
    }
    groups[cmd.type].push(cmd);
    return groups;
  }, {} as Record<DockerCommandType, DockerCommand[]>);

  // Ordem dos tipos
  const typeOrder: DockerCommandType[] = ['UP', 'RESET', 'STOP', 'REMOVE'];

  typeOrder.forEach(type => {
    if (groupedCommands[type] && groupedCommands[type].length > 0) {
      console.log(chalk.bold(`${getTypeIcon(type)} ${type}:`));
      groupedCommands[type].forEach((cmd, index) => {
        console.log(chalk.blue(`  ${index + 1}. ${chalk.bold(cmd.name)} ${chalk.gray(`⚡ ${cmd.command}`)}`));
      });
    }
  });

  console.log(chalk.green(`📊 Total: ${commands.length} comando(s)`));
}

export async function editDockerCommand(commandName: string): Promise<void> {
  if (!commandName) {
    console.log(chalk.red('❌ Erro: Nome do comando é obrigatório'));
    console.log(chalk.gray('📝 Exemplo: wicat docker edit wicat-fullstack'));
    return;
  }

  const existingCommand = getDockerCommand(commandName);

  if (!existingCommand) {
    console.log(chalk.red(`❌ Comando "${commandName}" não encontrado`));
    console.log(chalk.blue('💡 Use "wicat docker list" para ver comandos disponíveis'));
    return;
  }

  console.log(chalk.cyan(`🐳 Wicat Docker - Editar Comando "${commandName}"`));
  console.log('');

  try {
    const answers = await prompt([
      {
        type: 'input',
        name: 'name',
        message: '📝 Nome do comando:',
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
        type: 'select',
        name: 'type',
        message: '🏷️  Tipo do comando:',
        initial: existingCommand.type,
        choices: [
          { name: 'UP', message: '🟢 UP - Iniciar serviços' },
          { name: 'RESET', message: '🔄 RESET - Reiniciar serviços' },
          { name: 'STOP', message: '🟡 STOP - Parar serviços' },
          { name: 'REMOVE', message: '🔴 REMOVE - Remover serviços' }
        ]
      } as any,
      {
        type: 'input',
        name: 'command',
        message: '⚡ Comando para executar:',
        initial: existingCommand.command,
        validate: (value: string) => {
          if (!value.trim()) {
            return 'Comando é obrigatório';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'shortcut',
        message: '🔗 Atalho (opcional - ex: rw, start, stop):',
        initial: existingCommand.shortcut || '',
        validate: (value: string) => {
          if (value.trim() && value.includes(' ')) {
            return 'Atalho não pode conter espaços';
          }
          return true;
        }
      }
    ]) as { name: string; type: DockerCommandType; command: string; shortcut: string };

    // Se o nome mudou, remove o comando antigo
    if (answers.name !== existingCommand.name) {
      deleteDockerCommand(existingCommand.name);
    }

    const command: DockerCommand = {
      name: answers.name,
      type: answers.type,
      command: answers.command.trim(),
      shortcut: answers.shortcut.trim() || undefined
    };

    saveDockerCommand(command);

    console.log('');
    console.log(chalk.green('✅ Comando atualizado com sucesso!'));
    console.log(chalk.blue(`📝 Nome: ${command.name}`));
    console.log(chalk.blue(`🏷️  Tipo: ${command.type}`));
    console.log(chalk.blue(`⚡ Comando: ${command.command}`));
    if (command.shortcut) {
      console.log(chalk.blue(`🔗 Atalho: wicat d ${command.shortcut}`));
    }

  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}

export async function removeDockerCommand(commandName: string): Promise<void> {
  if (!commandName) {
    console.log(chalk.red('❌ Erro: Nome do comando é obrigatório'));
    console.log(chalk.gray('📝 Exemplo: wicat docker remove wicat-fullstack'));
    return;
  }

  const existingCommand = getDockerCommand(commandName);

  if (!existingCommand) {
    console.log(chalk.red(`❌ Comando "${commandName}" não encontrado`));
    console.log(chalk.blue('💡 Use "wicat docker list" para ver comandos disponíveis'));
    return;
  }

  console.log(chalk.cyan(`🐳 Wicat Docker - Remover Comando "${commandName}"`));
  console.log('');
  console.log(chalk.yellow('⚠️  ATENÇÃO: Esta ação é irreversível!'));
  console.log('');
  console.log(chalk.blue(`📝 Nome: ${existingCommand.name}`));
  console.log(chalk.blue(`🏷️  Tipo: ${existingCommand.type}`));
  console.log(chalk.blue(`⚡ Comando: ${existingCommand.command}`));
  console.log('');

  try {
    const confirmation = await prompt({
      type: 'input',
      name: 'confirmText',
      message: `${chalk.red('🔥 Digite "excluir" para confirmar a exclusão:')}`,
      validate: (value: string) => {
        if (value !== 'excluir') {
          return 'Digite exatamente "excluir" para confirmar';
        }
        return true;
      }
    }) as { confirmText: string };

    if (confirmation.confirmText === 'excluir') {
      const success = deleteDockerCommand(commandName);

      if (success) {
        console.log('');
        console.log(chalk.green('✅ Comando removido com sucesso!'));
        console.log(chalk.gray(`🗑️  "${commandName}" foi excluído permanentemente`));
      } else {
        console.log('');
        console.log(chalk.red('❌ Erro ao remover comando'));
      }
    } else {
      console.log('');
      console.log(chalk.yellow('⚠️  Operação cancelada - texto de confirmação incorreto'));
    }

  } catch (error) {
    console.log('');
    console.log(chalk.yellow('⚠️  Operação cancelada'));
  }
}