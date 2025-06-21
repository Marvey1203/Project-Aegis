import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Resend } from 'resend';
import { config } from '../../config/index.js';
// Define the structure of the email data we expect as input
const emailSchema = z.object({
    to: z.string().email().describe('The recipient\'s email address.'),
    from: z.string().email().describe('The sender\'s email address (e.g., "noreply@ourstore.com").'),
    subject: z.string().describe('The subject line of the email.'),
    html: z.string().describe('The HTML body of the email.'),
});
class CommunicationTool extends Tool {
    name = 'sendEmailTool';
    description = 'Sends an email using the Resend API. The input must be a JSON string containing "to", "from", "subject", and "html" properties.';
    schema = z.object({
        input: z.string().optional(),
    }).transform(val => val?.input ?? '');
    resend;
    constructor() {
        super();
        const resendApiKey = config.resend?.apiKey;
        if (resendApiKey) {
            this.resend = new Resend(resendApiKey);
        }
        else {
            this.resend = null;
            console.warn('Resend API key is not configured. The sendEmailTool will not be functional.');
        }
    }
    async _call(input) {
        if (!this.resend) {
            return 'Error: Resend API key is not configured. Cannot send email.';
        }
        if (!input) {
            return 'Error: Input JSON string for the email must be provided.';
        }
        try {
            const emailData = JSON.parse(input);
            const validatedData = emailSchema.parse(emailData);
            const { data, error } = await this.resend.emails.send(validatedData);
            if (error) {
                console.error('Error sending email via Resend:', error);
                return `Failed to send email. Error: ${error.message}`;
            }
            return `Successfully sent email. Message ID: ${data?.id}`;
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return `Error: Invalid email data format. ${error.message}`;
            }
            return `An unexpected error occurred while sending the email: ${error.message}`;
        }
    }
}
export const communicationTool = new CommunicationTool();
//# sourceMappingURL=communicationTool.js.map