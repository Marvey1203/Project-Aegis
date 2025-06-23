import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
const DAILY_AD_BUDGET_LIMIT = 20.00; // Hardcoded for V1
class FinancialCircuitBreakerTool extends Tool {
    name = 'financialCircuitBreakerTool';
    description = `Checks if a proposed ad spend is within the daily budget limit of $${DAILY_AD_BUDGET_LIMIT}. Returns 'APPROVED' or 'REJECTED'.`;
    schema = z.object({
        input: z.string().optional(),
    }).transform(val => val?.input ?? '');
    async _call(input) {
        let proposedSpend = 0;
        try {
            // Assuming input is a JSON string like '{"spend": 10.00}'
            const parsedInput = JSON.parse(input);
            proposedSpend = parseFloat(parsedInput.spend);
            if (isNaN(proposedSpend)) {
                return 'Error: Invalid spend amount provided.';
            }
        }
        catch (e) {
            return 'Error: Invalid JSON input for spend amount.';
        }
        // This is a simplified check for V1. A real implementation would check a database of the day's total spend.
        if (proposedSpend > DAILY_AD_BUDGET_LIMIT) {
            return 'REJECTED';
        }
        return 'APPROVED';
    }
}
export const financialCircuitBreakerTool = new FinancialCircuitBreakerTool();
//# sourceMappingURL=financialCircuitBreakerTool.js.map