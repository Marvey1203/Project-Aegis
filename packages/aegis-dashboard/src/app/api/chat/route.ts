// packages/aegis-dashboard/src/app/api/chat/route.ts

// The 'Message' import is no longer needed.

export const maxDuration = 60;

// --- TYPE DEFINITIONS FOR A CLEANER, SAFER FUNCTION ---
// This defines the structure of the data we expect from the Janus agent's response.
type JanusStep = [string, string | object];

interface JanusResponse {
  pastSteps: JanusStep[];
  plan: string[];
  response?: string;
}

/**
 * Formats the final state from the Janus agent into a readable Markdown report.
 * This function is now type-safe.
 */
function formatJanusReport(data: JanusResponse): string {
  if (!data.pastSteps || !Array.isArray(data.pastSteps) || data.pastSteps.length === 0) {
    return data.response || "Mission completed with no steps to report.";
  }

  let report = "### Aegis Mission Report\n\n---\n\n";
  for (const stepData of data.pastSteps) {
    if (!Array.isArray(stepData) || stepData.length < 2) continue;
    
    const [step, result] = stepData;
    report += `**✅ STEP: ${step}**\n\n`;
    
    // Clean up the result string for better readability
    const cleanedResult = (typeof result === 'string' ? result : JSON.stringify(result, null, 2))
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/```json/g, '```\n')
      .replace(/```/g, '');
      
    report += `**📊 RESULT:**\n\`\`\`\n${cleanedResult}\n\`\`\`\n\n---\n\n`;
  }

  if (data.plan && data.plan.length === 0) {
     report += "**Mission Complete: Plan executed successfully.**";
  } else {
     report += "**Mission Incomplete: The plan was halted before completion.**";
  }
 
  return report;
}


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }
    const command = lastUserMessage.content;

    const aegisResponse = await fetch('http://localhost:3002/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    if (!aegisResponse.ok) {
      const errorText = await aegisResponse.text();
      console.error('Aegis Core API Error:', errorText);
      const errorStream = new ReadableStream({
        start: controller => {
          controller.enqueue(new TextEncoder().encode(`Error from Aegis Core: ${errorText}`));
          controller.close();
        }
      });
      return new Response(errorStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const aegisData = await aegisResponse.json();
    const reportText = formatJanusReport(aegisData);
    
    // Manually create a ReadableStream using Web Standard APIs.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(reportText));
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return new Response('Failed to connect to the Aegis Core API.', { status: 500 });
  }
}