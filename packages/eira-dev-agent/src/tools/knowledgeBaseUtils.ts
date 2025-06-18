// src/tools/knowledgeBaseUtils.ts

import * as fs from 'fs/promises';
import * as path from 'path';

// --- Type Definitions (Centralized) ---
export interface Task {
  taskId: string;
  taskDescription: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "deferred";
  relevantFiles?: string[];
  notes?: string;
}

export interface Sprint {
  sprintId: string;
  sprintGoal: string;
  sprintStatus: "planned" | "active" | "completed" | "on-hold";
  tasks: Task[];
  currentTaskId: string | null;
  sprintSummary?: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  keyFileLocations?: string[];
  projectSummary?: string;
  currentSprintId: string | null;
  sprints: Sprint[];
}

export interface ActiveContext {
  projectId: string | null;
  sprintId: string | null;
  taskId: string | null;
}

export interface KnowledgeBase {
  activeContext: ActiveContext | null;
  projects: Project[];
  knowledgeBase: any[];
  userPreferences: any;
  sessionSummaries: any[];
}

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'eira_knowledge_base.json');

// The single, resilient function for reading the KB
export async function readKnowledgeBase(): Promise<KnowledgeBase> {
  try {
    const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8');
    return JSON.parse(content) as KnowledgeBase;
  } catch (error: any) {
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
export async function writeKnowledgeBase(kb: KnowledgeBase): Promise<void> {
  try {
    await fs.writeFile(KNOWLEDGE_BASE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
  } catch (error: any) {
    throw new Error(`Error writing knowledge base: ${error.message}`);
  }
}