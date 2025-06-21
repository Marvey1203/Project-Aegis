import { tavilySearchTool } from './searchTools.js';
import { getCurrentTimestampTool } from './dateTimeTools.js';
import { findAndReplaceInFileTool } from './findAndReplaceInFileTool.js';
import { addKnowledgeBaseEntryTool } from './knowledgeBaseTools.js';
import { createProjectTool, createSprintTool, createTaskTool } from './projectManagementTools.js';
import { basicPuppeteerScrapeTool, advancedScrapeTool } from './scrapingTools.js';
import { askHumanForHelpTool } from './askHumanForHelpTool.js';
import { createFileTool } from './createFileTool.js';
import { listFilesTool } from './listFilesTool.js';
import { readFilesTool } from './readFilesTool.js';
import { writeFileTool } from './writeFileTool.js';
import { summarizeAndArchiveChatHistoryTool } from './summarizeAndArchiveChatHistoryTool.js';
import { lintingTool } from './lintingTool.js';
import { updateSprintStatusTool } from './updateSprintStatusTool.js';
import { updateTaskStatusTool } from './updateTaskStatusTool.js';
import { readKnowledgeBaseTool } from './readKnowledgeBaseTool.js';
import { runPackageBuildTool } from './runPackageBuildTool.js';
import { deleteFileTool } from './deleteFileTool.js';
import { queryKnowledgeBaseTool } from './queryKnowledgeBaseTool.js';
import { updateKnowledgeBaseEntryTool } from './updateKnowledgeBaseEntryTool.js';
import { deleteKnowledgeBaseEntryTool } from './deleteKnowledgeBaseEntryTool.js';
import { deleteSprintTool } from './deleteSprintTool.js';
import { moveSprintTool } from './moveSprintTool.js';
import { createDirectoryTool } from './createDirectoryTool.js';
import { deleteDirectoryTool } from './deleteDirectoryTool.js';
import { reviewMyKnowledgeBaseTool } from './reviewMyKnowledgeBaseTool.js';
import { ingestDocumentationTool } from './ingestDocumentationTool.js';
import { queryLocalDocsTool } from './queryLocalDocsTool.js';
import { humanConfirmationTool } from './humanConfirmationTool.js';
import { simpleHtmlScrapeTool } from './simpleHtmlScrapeTool.js'; // Added new tool import
// Corrected: Using any[] to resolve the complex type inference issue.
export function getTools() {
    return [
        tavilySearchTool,
        getCurrentTimestampTool,
        findAndReplaceInFileTool,
        addKnowledgeBaseEntryTool,
        createProjectTool,
        createSprintTool,
        createTaskTool,
        basicPuppeteerScrapeTool,
        advancedScrapeTool,
        askHumanForHelpTool,
        createFileTool,
        listFilesTool,
        readFilesTool,
        writeFileTool,
        summarizeAndArchiveChatHistoryTool,
        lintingTool,
        updateSprintStatusTool,
        updateTaskStatusTool,
        readKnowledgeBaseTool,
        runPackageBuildTool,
        deleteFileTool,
        queryKnowledgeBaseTool,
        updateKnowledgeBaseEntryTool,
        deleteKnowledgeBaseEntryTool,
        deleteSprintTool,
        moveSprintTool,
        createDirectoryTool,
        deleteDirectoryTool,
        reviewMyKnowledgeBaseTool,
        ingestDocumentationTool,
        queryLocalDocsTool,
        humanConfirmationTool,
        simpleHtmlScrapeTool, // Added new tool to the array
    ];
}
