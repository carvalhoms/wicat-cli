import { v4 as uuidv4 } from 'uuid';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import enquirer from 'enquirer';

const { prompt } = enquirer;

interface UuidOptions {
  count?: string;
  copy?: boolean;
}

export async function generateUuids(options: UuidOptions): Promise<void> {
  let quantity: number;

  // Se não foi especificada quantidade, pergunta interativamente
  if (!options.count || options.count === '1') {
    // Cabeçalho elegante primeiro
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    🚀 UUID Generator v4 - Professional Edition 🚀           ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    ⚡ Gerador de UUIDs rápido e eficiente                   ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    📋 Copia automaticamente para área de transferência      ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    🎯 Formato otimizado para produtividade                  ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');

    console.log(chalk.blue('Configuração:'));
    
    const response = await prompt({
      type: 'input',
      name: 'quantity',
      message: '📝 Quantos UUIDs você quer gerar?',
      initial: '1',
      validate: (value: string) => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) {
          return 'Por favor, forneça um número válido.';
        }
        if (num > 10000) {
          return 'Quantidade muito grande. Máximo permitido: 10.000';
        }
        return true;
      }
    }) as { quantity: string };

    quantity = parseInt(response.quantity);
  } else {
    quantity = parseInt(options.count);
    
    // Cabeçalho elegante
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    🚀 UUID Generator v4 - Professional Edition 🚀           ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    ⚡ Gerador de UUIDs rápido e eficiente                   ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    📋 Copia automaticamente para área de transferência      ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '    🎯 Formato otimizado para produtividade                  ' + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '                                                              ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');

    // Validações
    if (isNaN(quantity) || quantity <= 0) {
      console.log(chalk.red('❌ Erro: Por favor, forneça um número válido.'));
      console.log(chalk.gray('📝 Exemplo: wicat uuids -c 10'));
      return;
    }

    if (quantity > 10000) {
      console.log(chalk.red('❌ Erro: Quantidade muito grande. Máximo permitido: 10.000'));
      return;
    }
  }

  console.log(chalk.blue('Processando:'));

  // Gera os UUIDs
  const uuids: string[] = [];
  
  for (let i = 1; i <= quantity; i++) {
    const uuid = uuidv4();
    uuids.push(uuid);
    
    // Mostra barra de progresso para quantidades maiores
    if (quantity > 1) {
      showProgress(i, quantity);
    }
    
    // Pequena pausa para visualizar o progresso
    if (quantity <= 100) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Quebra de linha após a barra de progresso
  if (quantity > 1) {
    console.log('');
  }

  const uuidsText = uuids.join('\n');

  // Copia para área de transferência se solicitado (padrão é true)
  if (options.copy !== false) {
    try {
      await clipboardy.write(uuidsText);
      console.log('');
      console.log(chalk.green(`✅ ${quantity} UUID(s) gerado(s) e 📋 Copiados com sucesso!`));
    } catch (error) {
      console.log('');
      console.log(chalk.green(`✅ ${quantity} UUID(s) gerado(s)!`));
      console.log(chalk.yellow('⚠️  Não foi possível copiar para área de transferência'));
    }
  } else {
    console.log('');
    console.log(chalk.green(`✅ ${quantity} UUID(s) gerado(s)!`));
  }

  // Mostra os UUIDs se a quantidade for pequena
  if (quantity <= 10) {
    console.log('');
    console.log(chalk.blue('🔍 UUIDs gerados:'));
    console.log(chalk.blue('━━━━━━━━━━━━━━━━'));
    console.log(chalk.white(uuidsText));
  }
}

function showProgress(current: number, total: number): void {
  const width = 50;
  const percentage = Math.floor((current * 100) / total);
  const completed = Math.floor((current * width) / total);
  const remaining = width - completed;
  
  const progressBar = '█'.repeat(completed) + '░'.repeat(remaining);
  
  process.stdout.write(`\r🔄 [${chalk.green(progressBar)}] ${percentage}% (${current}/${total})`);
}
