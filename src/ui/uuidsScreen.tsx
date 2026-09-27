import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { v4 as uuidv4 } from 'uuid';
import clipboardy from 'clipboardy';

interface Result {
  uuids: string[];
  copied: boolean;
}

interface Props {
  onBack: () => void;
}

export function UuidsScreen({ onBack }: Props): React.JSX.Element {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    } else if (result && key.return) {
      setResult(null);
    }
  });

  async function generate(value: string): Promise<void> {
    const count = value.trim() === '' ? 1 : parseInt(value);
    if (isNaN(count) || count <= 0) {
      setError('Informe um número válido.');
      return;
    }
    if (count > 10000) {
      setError('Máximo permitido: 10.000.');
      return;
    }

    const uuids = Array.from({ length: count }, () => uuidv4());
    let copied = true;
    try {
      await clipboardy.write(uuids.join('\n'));
    } catch {
      copied = false;
    }
    setError('');
    setResult({ uuids, copied });
  }

  if (result) {
    return (
      <Box flexDirection="column">
        <Text color="green">
          ✔ {result.uuids.length} UUID(s) gerado(s){result.copied ? ' e copiados' : ''}
        </Text>
        {!result.copied && <Text color="yellow">Não foi possível copiar para a área de transferência.</Text>}
        {result.uuids.length <= 10 && (
          <Box flexDirection="column" marginTop={1}>
            {result.uuids.map(uuid => <Text key={uuid}>{uuid}</Text>)}
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray">enter gerar de novo</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>Quantos UUIDs? </Text>
        <TextInput value={quantity} placeholder="1" onChange={setQuantity} onSubmit={generate} />
      </Box>
      {error && <Text color="red">{error}</Text>}
    </Box>
  );
}
