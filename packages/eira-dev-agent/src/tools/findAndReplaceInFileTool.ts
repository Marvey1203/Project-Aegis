import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { resolveToolPath } from './path-resolver';

const findAndReplaceSchema = z.object({
  filePath: z.string().describe("The relative path of the file to be modified (e.g., 'src/components/myComponent.tsx')."),
  searchString: z.string().describe("The exact string or regular expression pattern to search for."),
  replacementString: z.string().describe("The string that will replace each occurrence of searchString."),
  isRegex: z.boolean().optional().default(false).describe("If true, searchString will be treated as a regular expression pattern. Defaults to false."),
  regexFlags: z.string().optional().default('g').describe("Regex flags (e.g., 'gi' for global, case-insensitive). Only used if isRegex is true. Defaults to 'g' (global)."),
});

export const findAndReplaceInFileTool = new DynamicStructuredTool({
  name: 'findAndReplaceInFileTool',
  description: 'Finds all occurrences of a search string (or regular expression) in a specified file and replaces them with a replacement string. The original file is overwritten with the changes.',
  schema: findAndReplaceSchema,
  func: async ({ filePath, searchString, replacementString, isRegex, regexFlags }) => {
    let absoluteFilePath: string;
    try {
      absoluteFilePath = await resolveToolPath(filePath);
    } catch (error: any) {
      return `Error resolving path: ${error.message}`;
    }

    try {
      await fs.access(absoluteFilePath); // Check if file exists
    } catch (error) {
      return `Error: File not found at ${filePath} (resolved to ${absoluteFilePath}).`;
    }

    let fileStats;
    try {
      fileStats = await fs.stat(absoluteFilePath);
      if (fileStats.isDirectory()) {
        return `Error: Path ${filePath} is a directory, not a file. Cannot perform find and replace.`;
      }
    } catch (error: any) {
      return `Error accessing file stats for ${filePath}: ${error.message}`;
    }
    
    let originalContent: string;
    try {
      originalContent = await fs.readFile(absoluteFilePath, 'utf8');
    } catch (error: any) {
      return `Error reading file ${filePath}: ${error.message}`;
    }

    let newContent: string;
    let occurrences = 0;

    if (isRegex) {
      try {
        const regex = new RegExp(searchString, regexFlags);
        if (regexFlags && regexFlags.includes('g')) {
             // Count occurrences for global regex
            occurrences = (originalContent.match(regex) || []).length;
        } else {
            // For non-global regex, it will replace only the first match or as per regex behavior without 'g'
            occurrences = originalContent.search(regex) !== -1 ? 1 : 0;
        }
        newContent = originalContent.replace(regex, replacementString);
      } catch (error: any) {
        return `Error creating or using regular expression: ${error.message}`;
      }
    } else {
      // Literal string replacement
      // A robust way to count non-overlapping occurrences
      let count = 0;
      let pos = originalContent.indexOf(searchString);
      while (pos !== -1 && searchString.length > 0) { // Ensure searchString is not empty to avoid infinite loop
        count++;
        pos = originalContent.indexOf(searchString, pos + searchString.length);
      }
      occurrences = count;
      if (searchString.length === 0) { // Handle empty search string case
          newContent = originalContent; // Or decide on specific behavior, e.g., error or no change
          occurrences = 0; // No "occurrences" of an empty string make sense in this context
      } else {
          newContent = originalContent.split(searchString).join(replacementString);
      }
    }

    if (originalContent === newContent) {
      return `Search string '${searchString}' not found or resulted in no change in '${filePath}'. File unchanged. Occurrences found: ${occurrences}.`;
    }

    try {
      // Ensure parent directory exists (though resolveToolPath might not guarantee this, writeFile should handle it or we might need mkdir)
      // fs.writeFile usually creates the file if it doesn't exist, but here we've already read it.
      // We might want to ensure the directory for absoluteFilePath exists if it was somehow deleted between read and write,
      // but typically this isn't an issue for an overwrite.
      await fs.writeFile(absoluteFilePath, newContent, 'utf8');
      return `Successfully performed find and replace in '${filePath}'. ${occurrences} occurrence(s) replaced.`;
    } catch (error: any) {
      return `Error writing to file ${filePath}: ${error.message}`;
    }
  },
});
