// packages/aegis-core/src/api/server.ts

import express from 'express';
import cors from 'cors';
// 1. UNCOMMENT THIS IMPORT (note the .js extension, which is good practice for TS with modules)
import { app as JanusAgent } from '../agents/janus.js';

const app = express();
const port = process.env.AEGIS_CORE_PORT || 3002;

app.use(cors());
app.use(express.json());

/**
 * The main command endpoint for the Janus orchestrator.
 * All commands from the Aegis Command Center will be sent here.
 */
app.post('/command', async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  console.log(`[Aegis Core] Received command: "${command}"`);

  try {
    // 2. UNCOMMENT THIS LINE TO ACTUALLY RUN THE AGENT
    const result = await JanusAgent.invoke({ input: command });

    // 3. REMOVE OR COMMENT OUT THE DUMMY RESPONSE
    // const result = { response: `Command processed: "${command}"` };

    console.log(`[Aegis Core] Janus response:`, result);
    // LangGraph's final output will be in the 'output' or a similarly named field in the state.
    // We need to extract the final response to send back. Let's assume it's in a 'response' field
    // or we can send the whole final state for debugging. For now, let's send the whole thing.
    res.json(result);
  } catch (error) {
    console.error('[Aegis Core] Error processing command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

export const startServer = () => {
  app.listen(port, () => {
    console.log(`[Aegis Core] Server listening on port ${port}`);
  });
};