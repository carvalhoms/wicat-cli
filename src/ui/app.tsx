import React, { useState } from 'react';
import { Box, Text, render, useApp, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { UuidsScreen } from './uuidsScreen.js';

type Screen = 'menu' | 'uuids';

interface MenuItem {
  label: string;
  value: Screen | 'exit';
}

// Mesma arte do console do wecat-web-v3 (app/plugins/wecat-console.client.ts)
const logo = [
  '                                _   _',
  ' __  __  __ ____  ____  ___ _ _| |_(R)',
  '(  \\/  \\/  / __ )/ ___)/ __` :_   _)',
  ' \\   /\\   /   __: (___: (__| | | (__',
  '  \\_/  \\_/ \\____)\\____)\\___,_| |___/',
].join('\n');

const menuItems: MenuItem[] = [
  { label: 'Gerar UUIDs', value: 'uuids' },
  { label: 'Sair', value: 'exit' }
];

function App(): React.JSX.Element {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('menu');

  useInput((input, key) => {
    if (screen === 'menu' && (input === 'q' || key.escape)) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="cyan">{logo}</Text>
        <Text color="gray"> ferramentas para desenvolvimento</Text>
      </Box>

      {screen === 'menu' && (
        <SelectInput
          items={menuItems}
          onSelect={(item: MenuItem) => (item.value === 'exit' ? exit() : setScreen(item.value))}
        />
      )}
      {screen === 'uuids' && <UuidsScreen onBack={() => setScreen('menu')} />}

      <Box marginTop={1}>
        <Text color="gray">
          {screen === 'menu' ? '↑↓ navegar · enter selecionar · esc sair' : 'esc voltar'}
        </Text>
      </Box>
    </Box>
  );
}

export async function startUi(): Promise<void> {
  const { waitUntilExit } = render(<App />);
  await waitUntilExit();
}
