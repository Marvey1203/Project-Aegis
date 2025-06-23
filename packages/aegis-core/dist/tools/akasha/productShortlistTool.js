import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
// Corrected: Use process.cwd() to get the project root directory.
const SHORTLIST_PATH = path.join(process.cwd(), 'product_shortlist.json');
// Helper function to read the shortlist
async function readShortlist() {
    try {
        const data = await fs.readFile(SHORTLIST_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, so return an empty list
            return [];
        }
        throw error;
    }
}
// Helper function to write to the shortlist
async function writeShortlist(data) {
    await fs.writeFile(SHORTLIST_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
class ProductShortlistTool extends Tool {
    name = 'productShortlistTool';
    description = 'Manages a shortlist of promising products. Can be used to add a new product to the list or to retrieve the entire list. Input should be a JSON string. To add, use \'{"action": "add", "product": {...}}\'. To get, use \'{"action": "get"}\'.';
    schema = z.object({
        input: z.string().optional(),
    }).transform(val => val?.input ?? '{"action":"get"}');
    async _call(input) {
        try {
            const { action, product } = JSON.parse(input);
            if (action === 'add') {
                if (!product) {
                    return 'Error: "product" data must be provided to add to the shortlist.';
                }
                const shortlist = await readShortlist();
                shortlist.push(product);
                await writeShortlist(shortlist);
                return `Successfully added product to the shortlist. The list now contains ${shortlist.length} products.`;
            }
            else if (action === 'get') {
                const shortlist = await readShortlist();
                if (shortlist.length === 0) {
                    return 'The product shortlist is currently empty.';
                }
                return JSON.stringify(shortlist, null, 2);
            }
            else {
                return "Error: Invalid action. Must be 'add' or 'get'.";
            }
        }
        catch (error) {
            return `An error occurred while managing the product shortlist: ${error.message}`;
        }
    }
}
export const productShortlistTool = new ProductShortlistTool();
//# sourceMappingURL=productShortlistTool.js.map