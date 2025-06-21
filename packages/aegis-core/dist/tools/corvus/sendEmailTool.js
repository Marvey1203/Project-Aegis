// src/tools/sendEmailTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
class SendEmailTool extends Tool {
    name = 'sendEmailTool';
    description = 'Sends an email using the Resend API.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { to, from, subject, html } = JSON.parse(arg);
            if (!to || !from || !subject || !html) {
                throw new Error('Missing required properties in input: to, from, subject, html.');
            }
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject,
                html,
            });
            if (error) {
                return `Error sending email: ${error.message}`;
            }
            return `Successfully sent email to ${to}. Message ID: ${data?.id}`;
        }
        catch (error) {
            return `Error sending email: ${error.message}`;
        }
    }
}
export const sendEmailTool = new SendEmailTool();
//# sourceMappingURL=sendEmailTool.js.map