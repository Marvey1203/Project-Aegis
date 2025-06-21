import { StreamingTextResponse, Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Get the last message from the user
  const lastUserMessage = messages[messages.length - 1];
  const command = lastUserMessage.content;

  try {
    // Forward the user's command to the aegis-core API
    const aegisResponse = await fetch('http://localhost:3001/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    if (!aegisResponse.ok) {
      const errorText = await aegisResponse.text();
      console.error('Aegis Core API Error:', errorText);
      return new Response(`Error from Aegis Core: ${errorText}`, {
        status: aegisResponse.status,
      });
    }

    // For now, we expect a simple JSON response like { response: "..." }
    // We will stream this back to the client.
    const aegisData = await aegisResponse.json();
    
    // Create a simple readable stream to send the response
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(aegisData.response || 'No response text.');
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Error calling Aegis Core API:', error);
    return new Response('Failed to connect to the Aegis Core API.', {
      status: 500,
    });
  }
}
