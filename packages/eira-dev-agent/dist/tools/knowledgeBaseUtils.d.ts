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
export declare function readKnowledgeBase(): Promise<KnowledgeBase>;
export declare function writeKnowledgeBase(kb: KnowledgeBase): Promise<void>;
