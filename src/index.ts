#!/usr/bin/env node

import { Command } from 'commander';
import { generateUuids } from './commands/uuids.js';
import { executeDockerInteractive, addDockerCommand, listDockerCommands, editDockerCommand, removeDockerCommand } from './commands/docker.js';
import { loadDockerCommands, getDockerCommand } from './utils/dockerConfig.js';

const program = new Command();

program
  .name('wicat')
  .description('Wicat CLI - Ferramentas para desenvolvimento e gerenciamento Docker')
  .version('1.0.0');

program
  .command('uuids')
  .alias('u')
  .description('Gera UUIDs v4 (interativo ou por parâmetro)')
  .option('-c, --count <number>', 'quantidade de UUIDs para gerar')
  .option('--no-copy', 'não copiar para área de transferência')
  .action(async (options) => {
    await generateUuids(options);
  });

// Comando docker com subcomandos
const dockerCommand = program
  .command('docker')
  .alias('d')
  .description('Gerenciamento Docker - Comandos organizados por tipo (UP/RESET/STOP/REMOVE)');

dockerCommand
  .command('add')
  .description('Adicionar novo comando Docker')
  .action(async () => {
    await addDockerCommand();
  });

dockerCommand
  .command('list')
  .description('Listar todos os comandos Docker')
  .action(async () => {
    await listDockerCommands();
  });

dockerCommand
  .command('edit <command>')
  .description('Editar um comando Docker existente')
  .action(async (command) => {
    await editDockerCommand(command);
  });

dockerCommand
  .command('remove <command>')
  .description('Remover um comando Docker existente')
  .action(async (command) => {
    await removeDockerCommand(command);
  });

// Comando docker principal (seletor interativo)
dockerCommand
  .action(async () => {
    await executeDockerInteractive();
  });

// Registrar atalhos dinâmicos
function registerShortcuts() {
  const commands = loadDockerCommands();

  commands.forEach(cmd => {
    if (cmd.shortcut) {
      dockerCommand
        .command(cmd.shortcut)
        .description(`Atalho para ${cmd.name} (${cmd.type})`)
        .action(async () => {
          // Executa o comando diretamente
          const { spawn } = await import('child_process');
          const chalk = await import('chalk');

          console.log(chalk.default.cyan('🐳 Wicat Docker - Atalho Rápido'));
          console.log(chalk.default.blue(`📝 Comando: ${cmd.name}`));
          console.log(chalk.default.blue(`🏷️  Tipo: ${cmd.type}`));
          console.log(chalk.default.blue(`⚡ Executando: ${cmd.command}`));
          console.log('');

          // Se for comando REMOVE, pedir confirmação
          if (cmd.type === 'REMOVE') {
            const enquirer = await import('enquirer');
            const { prompt } = enquirer.default;

            console.log(chalk.default.yellow('⚠️  ATENÇÃO: Este comando irá remover containers, imagens e volumes!'));
            console.log('');

            try {
              const confirmation = await prompt({
                type: 'input',
                name: 'confirmText',
                message: `${chalk.default.red('🔥 Digite "remove" para confirmar a execução:')}`,
                validate: (value: string) => {
                  if (value !== 'remove') {
                    return 'Digite exatamente "remove" para confirmar';
                  }
                  return true;
                }
              }) as { confirmText: string };

              if (confirmation.confirmText !== 'remove') {
                console.log('');
                console.log(chalk.default.yellow('⚠️  Operação cancelada'));
                return;
              }
            } catch (error) {
              console.log('');
              console.log(chalk.default.yellow('⚠️  Operação cancelada'));
              return;
            }

            console.log('');
          }

          console.log(chalk.default.green('🏃‍♂️ Executando comando...'));

          const child = spawn(cmd.command, {
            shell: true,
            stdio: 'inherit'
          });

          child.on('error', (error) => {
            console.log(chalk.default.red(`❌ Erro ao executar comando: ${error.message}`));
          });

          child.on('close', (code) => {
            if (code === 0) {
              console.log(chalk.default.green('✨ Done.'));
            } else {
              console.log(chalk.default.red(`❌ Comando finalizado com código: ${code}`));
            }
          });
        });
    }
  });
}

// Registrar atalhos antes de fazer parse
registerShortcuts();

program.parse();
