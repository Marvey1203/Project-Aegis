"use strict";
// src/tools/knowledgeBaseUtils.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readKnowledgeBase = readKnowledgeBase;
exports.writeKnowledgeBase = writeKnowledgeBase;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'eira_knowledge_base.json');
// The single, resilient function for reading the KB
async function readKnowledgeBase() {
    try {
        const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Knowledge base not found at ${KNOWLEDGE_BASE_PATH}. Creating a new one.`);
            return {
                activeContext: null,
                projects: [],
                knowledgeBase: [],
                userPreferences: {},
                sessionSummaries: [],
            };
        }
        throw new Error(`Error reading knowledge base: ${error.message}`);
    }
}
// The single function for writing the KB
async function writeKnowledgeBase(kb) {
    try {
        await fs.writeFile(KNOWLEDGE_BASE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
    }
    catch (error) {
        throw new Error(`Error writing knowledge base: ${error.message}`);
    }
}
