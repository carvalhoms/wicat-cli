import fs from 'fs';
import path from 'path';
import os from 'os';

export type DockerCommandType = 'UP' | 'RESET' | 'STOP' | 'REMOVE';

export interface DockerCommand {
  name: string;
  type: DockerCommandType;
  command: string;
}

const configDir = path.join(os.homedir(), '.wicat-cli');
const configFile = path.join(configDir, 'docker-commands.json');

// Garante que o diretório existe
function ensureConfigDir(): void {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

export function loadDockerCommands(): DockerCommand[] {
  ensureConfigDir();

  if (!fs.existsSync(configFile)) {
    return [];
  }

  try {
    const data = fs.readFileSync(configFile, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Erro ao carregar configurações docker:', error);
    return [];
  }
}

export function saveDockerCommands(commands: DockerCommand[]): void {
  ensureConfigDir();

  try {
    fs.writeFileSync(configFile, JSON.stringify(commands, null, 2));
  } catch (error) {
    console.error('Erro ao salvar configurações docker:', error);
  }
}

export function addDockerCommand(command: DockerCommand): void {
  const commands = loadDockerCommands();

  // Remove comando existente com mesmo nome (se houver)
  const filteredCommands = commands.filter(cmd => cmd.name !== command.name);

  // Adiciona o novo comando
  filteredCommands.push(command);

  saveDockerCommands(filteredCommands);
}

export function getDockerCommand(name: string): DockerCommand | undefined {
  const commands = loadDockerCommands();
  return commands.find(cmd => cmd.name === name);
}

export function removeDockerCommand(name: string): boolean {
  const commands = loadDockerCommands();
  const filteredCommands = commands.filter(cmd => cmd.name !== name);

  if (filteredCommands.length === commands.length) {
    return false; // Comando não encontrado
  }

  saveDockerCommands(filteredCommands);
  return true;
}