#!/usr/bin/env node

import { Command } from 'commander';
import { generateUuids } from './commands/uuids.js';
import { startUi } from './ui/app.js';

const program = new Command();

program
  .name('wecat')
  .description('Wecat CLI - Ferramentas para desenvolvimento')
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

// Sem argumentos abre a interface; com argumentos segue como comando direto
if (process.argv.length <= 2) {
  await startUi();
} else {
  program.parse();
}
