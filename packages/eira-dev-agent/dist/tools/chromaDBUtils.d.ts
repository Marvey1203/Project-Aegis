import { Metadata } from 'chromadb';
import 'dotenv/config';
/**
 * Stores a piece of text content in the ChromaDB vector store.
 * @param content The text content to store.
 * @param metadata Associated metadata for the content.
 * @returns The ID of the stored item.
 */
export declare function storeMemory(content: string, metadata?: Metadata): Promise<string>;
/**
 * Retrieves relevant memories from ChromaDB based on a semantic query.
 * @param query The query to search for.
 * @param maxResults The maximum number of results to return.
 * @returns An array of the most relevant documents.
 */
export declare function retrieveRelevantMemories(query: string, maxResults?: number): Promise<any[]>;
