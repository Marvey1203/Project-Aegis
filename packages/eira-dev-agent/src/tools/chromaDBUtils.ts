/* eslint-disable quotes */
// packages/eira-dev-agent/src/tools/chromaDBUtils.ts
import { ChromaClient, EmbeddingFunction, Metadata } from 'chromadb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import 'dotenv/config';

// --- Gemini Embedding Function ---
class GeminiEmbeddingFunction implements EmbeddingFunction {
    private geminiEmbedder: GoogleGenerativeAIEmbeddings;

    constructor() {
        this.geminiEmbedder = new GoogleGenerativeAIEmbeddings({
            model: 'embedding-001',
        });
    }

    public async generate(texts: string[]): Promise<number[][]> {
        return this.geminiEmbedder.embedDocuments(texts);
    }
}

// --- ChromaDB Client Initialization ---
const embedder = new GeminiEmbeddingFunction();
// Initialize in-memory by providing no arguments.
const client = new ChromaClient({ path: "http://localhost:8000" });
const EIRA_MEMORY_COLLECTION = 'eira_memory_collection';

async function getMemoryCollection() {
    return await client.getOrCreateCollection({
        name: EIRA_MEMORY_COLLECTION,
        embeddingFunction: embedder,
    });
}

/**
 * Stores a piece of text content in the ChromaDB vector store.
 * @param content The text content to store.
 * @param metadata Associated metadata for the content.
 * @returns The ID of the stored item.
 */
// Corrected: Use 'Metadata' type
export async function storeMemory(content: string, metadata: Metadata = {}): Promise<string> {
    const collection = await getMemoryCollection();
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await collection.add({
        ids: [id],
        documents: [content],
        metadatas: [metadata],
    });

    console.log(`[ChromaDB] Stored memory with ID: ${id}`);
    return id;
}

/**
 * Retrieves relevant memories from ChromaDB based on a semantic query.
 * @param query The query to search for.
 * @param maxResults The maximum number of results to return.
 * @returns An array of the most relevant documents.
 */
export async function retrieveRelevantMemories(query: string, maxResults: number = 5): Promise<any[]> {
    // Corrected: Use 'getMemoryCollection' with correct casing
    const collection = await getMemoryCollection();
    const results = await collection.query({
        queryTexts: [query],
        nResults: maxResults,
    });
    return results.documents[0] || [];
}