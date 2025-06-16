"use strict";
// packages/eira-dev-agent/src/config/eira.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EiraProjectConfig = void 0;
exports.EiraProjectConfig = {
    projectName: "Project Aegis",
    description: "Synthetic economic agent platform focused on ecommerce and dropshipping",
    paths: {
        coreSrc: "packages/aegis-core/src/",
        dashboardSrc: "packages/aegis-dashboard/src/",
    },
    importantFiles: [
        "agents.ts",
        "run-agent.ts",
        "tools.ts",
        "schemas.ts",
        "shopify-client.ts",
        "cj-client.ts"
    ],
    goals: [
        "Maintain modular, testable agent architecture",
        "Support human-in-the-loop operations",
        "Ensure profitable ecommerce dropshipping workflows",
        "Automate detection of redundant or broken code",
    ],
};
