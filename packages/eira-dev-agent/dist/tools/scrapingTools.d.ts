import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const basicPuppeteerScrapeTool: DynamicStructuredTool<z.ZodObject<{
    url: z.ZodString;
    waitForSelector: z.ZodOptional<z.ZodString>;
    targetSelector: z.ZodOptional<z.ZodString>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
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
}, string>;
export declare const advancedScrapeTool: DynamicStructuredTool<z.ZodObject<{
    url: z.ZodString;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        actionType: z.ZodEnum<["click", "type", "waitForSelector", "waitForTimeout", "selectOption", "scrollToElement", "focus"]>;
        selector: z.ZodOptional<z.ZodString>;
        textToType: z.ZodOptional<z.ZodString>;
        valueToSelect: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }, {
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }>, "many">>;
    extractions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        selector: z.ZodString;
        extractType: z.ZodDefault<z.ZodEnum<["text", "html", "attribute", "count", "list_text", "list_html", "list_attribute"]>>;
        attributeName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    globalTimeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    extractions: {
        selector: string;
        name: string;
        extractType: "text" | "html" | "attribute" | "count" | "list_text" | "list_html" | "list_attribute";
        attributeName?: string | undefined;
    }[];
    globalTimeout: number;
    actions?: {
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
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
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
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
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
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
        actionType: "waitForSelector" | "type" | "click" | "waitForTimeout" | "selectOption" | "scrollToElement" | "focus";
        timeout?: number | undefined;
        selector?: string | undefined;
        textToType?: string | undefined;
        valueToSelect?: string | undefined;
    }[] | undefined;
    globalTimeout?: number | undefined;
}, string>;
