"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveToolPath = resolveToolPath;
const path_1 = __importDefault(require("path"));
const eira_config_1 = require("../config/eira.config");
function resolveToolPath(filePath) {
    if (path_1.default.isAbsolute(filePath)) {
        return filePath;
    }
    if (filePath.startsWith('packages/')) {
        return path_1.default.join(process.cwd(), filePath);
    }
    if (filePath.startsWith("core/")) {
        return path_1.default.join(eira_config_1.EiraProjectConfig.paths.coreSrc, filePath.replace(/^core\//, ""));
    }
    if (filePath.startsWith("dashboard/")) {
        return path_1.default.join(eira_config_1.EiraProjectConfig.paths.dashboardSrc, filePath.replace(/^dashboard\//, ""));
    }
    return path_1.default.join(eira_config_1.EiraProjectConfig.paths.coreSrc, filePath);
}
