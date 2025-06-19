
// packages/aegis-core/src/test-corvus.ts

import { corvusExecutor } from './agents.js';

async function testCorvus() {
  console.log('--- Testing Corvus Agent ---');

  const emailDetails = {
    to: 'test@example.com', // Replace with a real test email address
    subject: 'Aegis Test Email',
    htmlBody: '<h1>Welcome to Project Aegis</h1><p>This is a test email from the Corvus agent.</p>',
  };

  try {
    const result = await corvusExecutor.invoke({
      input: JSON.stringify(emailDetails),
      chat_history: [],
    });
    console.log('--- Corvus Test Result ---');
    console.dir(result, { depth: null });
  } catch (error) {
    console.error('--- Corvus Test Failed ---');
    console.error(error);
  }
}

testCorvus();
