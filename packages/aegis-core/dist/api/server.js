import express from 'express';
import cors from 'cors';
// We will import the Janus agent app later when we are ready to use it
// import { app as JanusAgent } from './agents/janus';
const app = express();
const port = process.env.AEGIS_CORE_PORT || 3001;
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
        // Placeholder for invoking the Janus agent graph
        // const result = await JanusAgent.invoke({ input: command });
        const result = { response: `Command processed: "${command}"` }; // Dummy response
        console.log(`[Aegis Core] Janus response:`, result);
        res.json(result);
    }
    catch (error) {
        console.error('[Aegis Core] Error processing command:', error);
        res.status(500).json({ error: 'Failed to process command' });
    }
});
export const startServer = () => {
    app.listen(port, () => {
        console.log(`[Aegis Core] Server listening on port ${port}`);
    });
};
//# sourceMappingURL=server.js.map