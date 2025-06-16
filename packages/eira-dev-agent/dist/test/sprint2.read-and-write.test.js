"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var vitest_1 = require("vitest");
var eiraAgent_1 = require("../agent/eiraAgent");
var readFilesTool_1 = require("../tools/readFilesTool");
var writeFileTool_1 = require("../tools/writeFileTool");
// Spy on the tool's 'func' which is the actual logic function
var readSpy = vitest_1.vi.spyOn(readFilesTool_1.readFilesTool, 'func');
var writeSpy = vitest_1.vi.spyOn(writeFileTool_1.writeFileTool, 'func');
(0, vitest_1.describe)('Sprint 2: Journeyman Developer - Multi-Step Read/Write Test', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)('should successfully read a file, formulate a change, and write the new content back', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instruction, mockInitialSchemaContent, mockExpectedFinalContent, eira;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instruction = "\n      Your primary task is to add a 'priority' field to the ToolSchema in 'core/schemas.ts'.\n      To do this, you MUST first read the file 'core/schemas.ts' to get its current content.\n      Then, add 'priority: z.number().optional(),' to the ToolSchema.\n      Finally, write the complete, updated content back to the file 'core/schemas.ts'.\n    ";
                    mockInitialSchemaContent = "import { z } from 'zod';\n\nexport const ToolSchema = z.object({\n  name: z.string(),\n  description: z.string(),\n});\n\n// Other schemas...\n";
                    mockExpectedFinalContent = "import { z } from 'zod';\n\nexport const ToolSchema = z.object({\n  name: z.string(),\n  description: z.string(),\n  priority: z.number().optional(),\n});\n\n// Other schemas...\n";
                    readSpy.mockResolvedValue("--- FILE: core/schemas.ts ---\n".concat(mockInitialSchemaContent, "\n--- END OF FILE: core/schemas.ts ---"));
                    writeSpy.mockResolvedValue("Successfully wrote to core/schemas.ts");
                    return [4 /*yield*/, eiraAgent_1.EiraAgent.create()];
                case 1:
                    eira = _a.sent();
                    return [4 /*yield*/, eira.run(instruction)];
                case 2:
                    _a.sent();
                    // --- ASSERT ---
                    // 1. Assert the read tool was called.
                    (0, vitest_1.expect)(readSpy).toHaveBeenCalledOnce();
                    // 2. Precisely assert the content of the FIRST argument of that call.
                    (0, vitest_1.expect)(readSpy.mock.calls[0][0]).toEqual({ filePaths: ['core/schemas.ts'] });
                    // 3. Assert the write tool was called.
                    (0, vitest_1.expect)(writeSpy).toHaveBeenCalledOnce();
                    // 4. Precisely assert the content of the FIRST argument of the write call.
                    (0, vitest_1.expect)(writeSpy.mock.calls[0][0]).toEqual({
                        filePath: 'core/schemas.ts',
                        content: mockExpectedFinalContent,
                    });
                    return [2 /*return*/];
            }
        });
    }); }, 30000);
});
