/**
 * Applies a patch to a specified file.
 *
 * This tool allows for in-place modification of a file based on a
 * provided patch, typically in a standard format like unidiff.
 */
export interface PatchFileToolParams {
    /**
     * The relative path of the file to patch (e.g., 'src/module.ts').
     */
    filePath: string;
    /**
     * A string containing the patch data (e.g., the output of \`diff -u old_file new_file\`).
     */
    patchContent: string;
    /**
     * The format of the patch content. Defaults to 'unidiff'.
     * Other formats could be supported if the underlying implementation allows.
     */
    patchFormat?: 'unidiff' | string;
}
export interface PatchFileToolResult {
    /**
     * True if the patch was successfully applied, False otherwise.
     */
    success: boolean;
    /**
     * A message providing details about the operation's success or failure.
     * For example, "File patched successfully." or "Error: Patch did not apply cleanly."
     */
    message: string;
    /**
     * The full content of the file after patching, if successful.
     * Optional, as the primary confirmation is 'success'.
     */
    newContent?: string;
}
/**
 * Applies a patch to a specified file.
 *
 * @param params - The parameters for the patchFileTool.
 * @returns A promise that resolves with the result of the patch operation.
 */
export declare function patchFileTool(params: PatchFileToolParams): Promise<PatchFileToolResult>;
