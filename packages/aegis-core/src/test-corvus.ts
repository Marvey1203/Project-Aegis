
// src/test-corvus.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Explicitly load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


import { corvusExecutor } from './agents/corvus.js';

async function main() {
  const input = {
    input: "Send a test email to test@example.com from sender@example.com with the subject 'Test Email' and the body '<h1>This is a test</h1>'",
  };

  const result = await corvusExecutor.invoke(input);

  console.log(result);
}

main();
