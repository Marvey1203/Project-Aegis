
// src/tools/index.ts

import { tavilySearchTool } from "./searchTools";
import { getCurrentTimestampTool } from "./dateTimeTools";
import { findAndReplaceInFileTool } from "./findAndReplaceInFileTool";
import { addKnowledgeBaseEntryTool } from "./knowledgeBaseTools";
import { createProjectTool, createSprintTool, createTaskTool } from "./projectManagementTools";
import { basicPuppeteerScrapeTool, advancedScrapeTool } from "./scrapingTools";
import { askHumanForHelpTool } from "./askHumanForHelpTool";
import { createFileTool } from "./createFileTool";
import { listFilesTool } from "./listFilesTool";
import { readFilesTool } from "./readFilesTool";
import { writeFileTool } from "./writeFileTool";
import { summarizeAndArchiveChatHistoryTool } from "./summarizeAndArchiveChatHistoryTool";
import { lintingTool } from "./lintingTool";

export const allTools = [
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
];
