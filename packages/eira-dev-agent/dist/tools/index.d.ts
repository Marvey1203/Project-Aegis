export declare const allTools: (import("langchain/tools").Tool<any> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    filePath: import("zod").ZodString;
    find: import("zod").ZodString;
    replace: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    find: string;
    filePath: string;
    replace: string;
}, {
    find: string;
    filePath: string;
    replace: string;
}>, {
    find: string;
    filePath: string;
    replace: string;
}, {
    find: string;
    filePath: string;
    replace: string;
}, any> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    category: import("zod").ZodString;
    title: import("zod").ZodString;
    content: import("zod").ZodAny;
    tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
}, "strip", import("zod").ZodTypeAny, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}>, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    projectName: import("zod").ZodString;
    projectId: import("zod").ZodOptional<import("zod").ZodString>;
    projectDescription: import("zod").ZodOptional<import("zod").ZodString>;
    makeActiveProject: import("zod").ZodDefault<import("zod").ZodBoolean>;
}, "strip", import("zod").ZodTypeAny, {
    projectName: string;
    makeActiveProject: boolean;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
}, {
    projectName: string;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
    makeActiveProject?: boolean | undefined;
}>, {
    projectName: string;
    makeActiveProject: boolean;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
}, {
    projectName: string;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
    makeActiveProject?: boolean | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    projectId: import("zod").ZodString;
    sprintGoal: import("zod").ZodString;
    tasks: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
}, "strip", import("zod").ZodTypeAny, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}>, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    projectId: import("zod").ZodString;
    sprintId: import("zod").ZodString;
    taskDescriptions: import("zod").ZodArray<import("zod").ZodString, "many">;
}, "strip", import("zod").ZodTypeAny, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}>, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    url: import("zod").ZodString;
    waitForSelector: import("zod").ZodOptional<import("zod").ZodString>;
    targetSelector: import("zod").ZodOptional<import("zod").ZodString>;
    timeout: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
}, "strip", import("zod").ZodTypeAny, {
    url: string;
    timeout: number;
    waitForSelector?: string | undefined;
    targetSelector?: string | undefined;
}, {
    url: string;
    waitForSelector?: string | undefined;
    targetSelector?: string | undefined;
    timeout?: number | undefined;
}>, {
    url: string;
    timeout: number;
    waitForSelector?: string | undefined;
    targetSelector?: string | undefined;
}, {
    url: string;
    waitForSelector?: string | undefined;
    targetSelector?: string | undefined;
    timeout?: number | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    url: import("zod").ZodString;
    actions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
        actionType: import("zod").ZodEnum<["click", "type", "waitForSelector", "waitForTimeout", "selectOption", "scrollToElement", "focus"]>;
        selector: import("zod").ZodOptional<import("zod").ZodString>;
        textToType: import("zod").ZodOptional<import("zod").ZodString>;
        valueToSelect: import("zod").ZodOptional<import("zod").ZodString>;
        timeout: import("zod").ZodOptional<import("zod").ZodNumber>;
    }, "strip", import("zod").ZodTypeAny, {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }, {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }>, "many">>;
    extractions: import("zod").ZodArray<import("zod").ZodObject<{
        name: import("zod").ZodString;
        selector: import("zod").ZodString;
        extractType: import("zod").ZodDefault<import("zod").ZodEnum<["text", "html", "attribute", "count", "list_text", "list_html", "list_attribute"]>>;
        attributeName: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        selector: string;
        name: string;
        extractType: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute";
        attributeName?: string | undefined;
    }, {
        selector: string;
        name: string;
        extractType?: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute" | undefined;
        attributeName?: string | undefined;
    }>, "many">;
    globalTimeout: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodNumber>>;
}, "strip", import("zod").ZodTypeAny, {
    url: string;
    extractions: {
        selector: string;
        name: string;
        extractType: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute";
        attributeName?: string | undefined;
    }[];
    globalTimeout: number;
    actions?: {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }[] | undefined;
}, {
    url: string;
    extractions: {
        selector: string;
        name: string;
        extractType?: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute" | undefined;
        attributeName?: string | undefined;
    }[];
    actions?: {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }[] | undefined;
    globalTimeout?: number | undefined;
}>, {
    url: string;
    extractions: {
        selector: string;
        name: string;
        extractType: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute";
        attributeName?: string | undefined;
    }[];
    globalTimeout: number;
    actions?: {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }[] | undefined;
}, {
    url: string;
    extractions: {
        selector: string;
        name: string;
        extractType?: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute" | undefined;
        attributeName?: string | undefined;
    }[];
    actions?: {
        actionType: "type" | "waitForSelector" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }[] | undefined;
    globalTimeout?: number | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    question: import("zod").ZodString;
    context: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
    question: string;
    context?: string | undefined;
}, {
    question: string;
    context?: string | undefined;
}>, {
    question: string;
    context?: string | undefined;
}, {
    question: string;
    context?: string | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    filePath: import("zod").ZodString;
    content: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
    filePath: string;
    content?: string | undefined;
}, {
    filePath: string;
    content?: string | undefined;
}>, {
    filePath: string;
    content?: string | undefined;
}, {
    filePath: string;
    content?: string | undefined;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    directoryPath: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    directoryPath: string;
}, {
    directoryPath: string;
}>, {
    directoryPath: string;
}, {
    directoryPath: string;
}, any> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    filePaths: import("zod").ZodArray<import("zod").ZodString, "many">;
}, "strip", import("zod").ZodTypeAny, {
    filePaths: string[];
}, {
    filePaths: string[];
}>, {
    filePaths: string[];
}, {
    filePaths: string[];
}, any> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    filePath: import("zod").ZodString;
    content: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    filePath: string;
    content: string;
}, {
    filePath: string;
    content: string;
}>, {
    filePath: string;
    content: string;
}, {
    filePath: string;
    content: string;
}, any> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{}, "strip", import("zod").ZodTypeAny, {}, {}>, {}, {}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    projectId: import("zod").ZodString;
    sprintId: import("zod").ZodString;
    status: import("zod").ZodEnum<["planned", "active", "completed", "on-hold"]>;
}, "strip", import("zod").ZodTypeAny, {
    status: "planned" | "active" | "completed" | "on-hold";
    projectId: string;
    sprintId: string;
}, {
    status: "planned" | "active" | "completed" | "on-hold";
    projectId: string;
    sprintId: string;
}>, {
    status: "planned" | "active" | "completed" | "on-hold";
    projectId: string;
    sprintId: string;
}, {
    status: "planned" | "active" | "completed" | "on-hold";
    projectId: string;
    sprintId: string;
}, string> | import("langchain/tools").DynamicStructuredTool<import("zod").ZodObject<{
    projectId: import("zod").ZodString;
    sprintId: import("zod").ZodString;
    taskId: import("zod").ZodString;
    status: import("zod").ZodEnum<["pending", "in-progress", "completed", "blocked", "deferred"]>;
}, "strip", import("zod").ZodTypeAny, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}>, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, string>)[];
