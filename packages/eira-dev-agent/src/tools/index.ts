// packages/eira-dev-agent/src/tools/index.ts

// --- Core Tools ---
import { tavilySearchTool } from './searchTools.js';
import { getCurrentTimestampTool } from './dateTimeTools.js';
import { askHumanForHelpTool } from './askHumanForHelpTool.js';
import { humanConfirmationTool } from './humanConfirmationTool.js';

// --- File System Tools ---
import { createFileTool } from './createFileTool.js';
import { createDirectoryTool } from './createDirectoryTool.js';
import { listFilesTool } from './listFilesTool.js';
import { readFilesTool } from './readFilesTool.js';
import { writeFileTool } from './writeFileTool.js';
import { deleteFileTool } from './deleteFileTool.js';
import { deleteDirectoryTool } from './deleteDirectoryTool.js';
import { findAndReplaceInFileTool } from './findAndReplaceInFileTool.js';

// --- Development & Verification Tools ---
import { runPackageBuildTool } from './runPackageBuildTool.js';
import { lintingTool } from './lintingTool.js';
import { 
  gitStatusTool, 
  gitDiffTool, 
  gitAddTool, 
  gitCommitTool, 
  gitCreateBranchTool, 
  gitPushTool 
} from './gitTools.js';

// --- Text & Memory Tools ---
import { summarizeTextTool } from './summarizeTextTool.js';
import { storeMemoryTool, retrieveRelevantMemoriesTool } from './memoryManagementTools.js';

// --- DEPRECATED: Old Project Management (to be replaced by memory tools) ---
// We will keep these for now but will phase them out.
import { createProjectTool, createSprintTool, createTaskTool, findNextPendingTaskTool } from './projectManagementTools.js';
import { updateSprintStatusTool } from './updateSprintStatusTool.js';
import { updateTaskStatusTool } from './updateTaskStatusTool.js';


export function getTools(): any[] {
  return [
    // Core
    tavilySearchTool,
    getCurrentTimestampTool,
    askHumanForHelpTool,
    humanConfirmationTool,
    // Filesystem
    createFileTool,
    createDirectoryTool,
    listFilesTool,
    readFilesTool,
    writeFileTool,
    deleteFileTool,
    deleteDirectoryTool,
    findAndReplaceInFileTool,
    // Dev & Verification
    runPackageBuildTool,
    lintingTool,
    gitStatusTool,
    gitDiffTool,
    gitAddTool,
    gitCommitTool,
    gitCreateBranchTool,
    gitPushTool,
    // Text & Memory System
    summarizeTextTool,
    storeMemoryTool,
    retrieveRelevantMemoriesTool,
    // Deprecated Project Management
    createProjectTool,
    createSprintTool,
    createTaskTool,
    findNextPendingTaskTool,
    updateSprintStatusTool,
    updateTaskStatusTool,
  ];
}
