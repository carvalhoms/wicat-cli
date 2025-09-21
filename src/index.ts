#!/usr/bin/env node

import { Command } from 'commander';
import { generateUuids } from './commands/uuids.js';
import { executeGo, addGoStack, listGoStacks, editGoStack } from './commands/go.js';
import { executeDockerInteractive, addDockerCommand, listDockerCommands, editDockerCommand, removeDockerCommand } from './commands/docker.js';

const program = new Command();

program
  .name('wicat')
  .description('Wicat CLI - Ferramentas para desenvolvimento')
  .version('1.0.0');

program
  .command('uuids')
  .description('Gera UUIDs v4 (interativo ou por parâmetro)')
  .option('-c, --count <number>', 'quantidade de UUIDs para gerar')
  .option('--no-copy', 'não copiar para área de transferência')
  .action(async (options) => {
    await generateUuids(options);
  });

// Comando go com subcomandos
const goCommand = program
  .command('go')
  .description('Sistema de navegação rápida para projetos');

goCommand
  .command('add')
  .description('Adicionar nova stack de navegação')
  .action(async () => {
    await addGoStack();
  });

goCommand
  .command('list')
  .description('Listar todas as stacks disponíveis')
  .action(async () => {
    await listGoStacks();
  });

goCommand
  .command('edit <stack>')
  .description('Editar uma stack existente')
  .action(async (stack) => {
    await editGoStack(stack);
  });

// Comando go principal (executar stack)
goCommand
  .argument('[stack]', 'nome da stack para navegar')
  .option('-e, --exec', 'executar comando após navegar')
  .option('--get-path', 'retorna apenas o caminho (uso interno)')
  .option('--get-exec', 'retorna apenas o comando exec (uso interno)')
  .action(async (stack, options) => {
    // Se não tem stack, mostra help
    if (!stack) {
      goCommand.help();
      return;
    }
    await executeGo(stack, options.exec, options.getPath, options.getExec);
  });

// Comando docker com subcomandos
const dockerCommand = program
  .command('docker')
  .description('Seletor interativo de comandos Docker agrupados por tipo');

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

program.parse();
