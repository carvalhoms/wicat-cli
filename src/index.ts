#!/usr/bin/env node

import { Command } from 'commander';
import { generateUuids } from './commands/uuids.js';

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

program.parse();
