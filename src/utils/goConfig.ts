import fs from 'fs';
import path from 'path';
import os from 'os';

export interface GoCommand {
  name: string;
  path: string;
  execCommand: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.wicat-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'go-commands.json');

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadGoCommands(): GoCommand[] {
  ensureConfigDir();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar comandos go:', error);
    return [];
  }
}

export function saveGoCommands(commands: GoCommand[]): void {
  ensureConfigDir();
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(commands, null, 2));
  } catch (error) {
    console.error('Erro ao salvar comandos go:', error);
    throw error;
  }
}

export function addGoCommand(command: GoCommand): void {
  const commands = loadGoCommands();
  
  // Remove comando existente com mesmo nome
  const filteredCommands = commands.filter(cmd => cmd.name !== command.name);
  
  filteredCommands.push(command);
  saveGoCommands(filteredCommands);
}

export function getGoCommand(name: string): GoCommand | undefined {
  const commands = loadGoCommands();
  return commands.find(cmd => cmd.name === name);
}

export function removeGoCommand(name: string): boolean {
  const commands = loadGoCommands();
  const filteredCommands = commands.filter(cmd => cmd.name !== name);
  
  if (filteredCommands.length === commands.length) {
    return false; // Comando não encontrado
  }
  
  saveGoCommands(filteredCommands);
  return true;
}
