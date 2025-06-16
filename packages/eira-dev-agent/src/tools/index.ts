import { createFileTool } from './createFileTool';
import { findAndReplaceInFileTool } from './findAndReplaceInFileTool';
import { getCurrentDirectoryTool } from './getCurrentDirectoryTool';
import { listFilesTool } from './listFilesTool';
import { readFilesTool } from './readFilesTool';
import { runTestCommandTool } from './runTestCommandTool';
import { writeFileTool } from './writeFileTool';
import { askHumanForHelpTool } from './askHumanForHelpTool'; // Added import

export const allTools = [
  createFileTool,
  findAndReplaceInFileTool,
  getCurrentDirectoryTool,
  listFilesTool,
  readFilesTool,
  runTestCommandTool,
  writeFileTool,
  askHumanForHelpTool, // Added tool
];

export {
  createFileTool,
  findAndReplaceInFileTool,
  getCurrentDirectoryTool,
  listFilesTool,
  readFilesTool,
  runTestCommandTool,
  writeFileTool,
  askHumanForHelpTool, // Added export
};
