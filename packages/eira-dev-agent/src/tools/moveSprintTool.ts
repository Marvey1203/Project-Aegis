
// src/tools/moveSprintTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase, writeKnowledgeBase } from './knowledgeBaseUtils.js';

class MoveSprintTool extends Tool {
  name = 'moveSprintTool';
  description = 'Moves a sprint and all of its tasks from one project to another.';
  
  schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');

  async _call(arg: string | undefined): Promise<string> {
    try {
      if (!arg) {
        throw new Error('No input provided.');
      }
      const { sprintId, sourceProjectId, destinationProjectId } = JSON.parse(arg);

      if (!sprintId || !sourceProjectId || !destinationProjectId) {
        throw new Error('Missing "sprintId", "sourceProjectId", or "destinationProjectId" property in input.');
      }

      const kb = await readKnowledgeBase();
      const sourceProject = kb.projects.find(p => p.projectId === sourceProjectId);
      const destinationProject = kb.projects.find(p => p.projectId === destinationProjectId);

      if (!sourceProject) {
        return `Error: Source project with ID '${sourceProjectId}' not found.`;
      }
      if (!destinationProject) {
        return `Error: Destination project with ID '${destinationProjectId}' not found.`;
      }

      const sprintIndex = sourceProject.sprints.findIndex(s => s.sprintId === sprintId);

      if (sprintIndex === -1) {
        return `Error: Sprint with ID '${sprintId}' not found in source project '${sourceProjectId}'.`;
      }

      const [sprintToMove] = sourceProject.sprints.splice(sprintIndex, 1);
      destinationProject.sprints.push(sprintToMove);

      await writeKnowledgeBase(kb);

      return `Successfully moved sprint with ID '${sprintId}' from project '${sourceProjectId}' to project '${destinationProjectId}'.`;
    } catch (error: any) {
      return `Error moving sprint: ${error.message}`;
    }
  }
}

export const moveSprintTool = new MoveSprintTool();
