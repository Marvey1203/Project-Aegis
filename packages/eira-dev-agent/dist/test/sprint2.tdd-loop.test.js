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
var runTestCommandTool_1 = require("../tools/runTestCommandTool");
var readFilesTool_1 = require("../tools/readFilesTool");
var writeFileTool_1 = require("../tools/writeFileTool");
var runTestSpy = vitest_1.vi.spyOn(runTestCommandTool_1.runTestCommandTool, 'func');
var readSpy = vitest_1.vi.spyOn(readFilesTool_1.readFilesTool, 'func');
var writeSpy = vitest_1.vi.spyOn(writeFileTool_1.writeFileTool, 'func');
(0, vitest_1.describe)('Sprint 2: Journeyman Developer - Autonomous TDD Loop', function () {
    var buggyFilePath = 'packages/eira-dev-agent/src/test/fixtures/buggy-function.ts';
    var testFilePath = 'packages/eira-dev-agent/src/test/fixtures/buggy-function.test.ts';
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)('should run tests, analyze the failure, fix the code, and re-run tests to confirm success', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instruction, mockStderr, buggyFileContent, eira, expectedCorrectedCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instruction = "The test at ".concat(testFilePath, " is failing. Run the test, diagnose the problem from the error, fix the code, and confirm with another test run.");
                    mockStderr = "FAIL  ".concat(testFilePath, "\nAssertionError: expected 5 to be 6\n \u276F ").concat(buggyFilePath, ":2:10");
                    runTestSpy.mockResolvedValueOnce("--- TEST RESULTS ---\nExit Code: 1\n--- STDERR ---\n".concat(mockStderr, "\n--- END ---"));
                    buggyFileContent = "export function multiply(a: number, b: number): number {\n  return a + b;\n}";
                    readSpy.mockResolvedValue("--- FILE: ".concat(buggyFilePath, " ---\n").concat(buggyFileContent, "\n--- END ---"));
                    // Mock 3: The writeFileTool call. We don't need to mock its return value, just spy on it.
                    writeSpy.mockResolvedValue("Successfully wrote to ".concat(buggyFilePath));
                    // Mock 4: The SECOND runTestCommandTool call returns a SUCCESS. This is crucial for breaking the loop.
                    runTestSpy.mockResolvedValueOnce("--- TEST RESULTS ---\nExit Code: 0\n--- STDOUT ---\nPASS  ".concat(testFilePath, "\n--- STDERR ---\nNo stderr.\n--- END ---"));
                    return [4 /*yield*/, eiraAgent_1.EiraAgent.create()];
                case 1:
                    eira = _a.sent();
                    return [4 /*yield*/, eira.run(instruction)];
                case 2:
                    _a.sent();
                    // --- ASSERT ---
                    // We expect a perfect 4-step sequence: Test -> Read -> Write -> Test
                    (0, vitest_1.expect)(runTestSpy).toHaveBeenCalledTimes(2);
                    (0, vitest_1.expect)(readSpy).toHaveBeenCalledOnce();
                    (0, vitest_1.expect)(writeSpy).toHaveBeenCalledOnce();
                    // Verify the agent correctly identified the buggy file from the stderr.
                    (0, vitest_1.expect)(readSpy.mock.calls[0][0]).toEqual({ filePaths: [buggyFilePath] });
                    expectedCorrectedCode = "export function multiply(a: number, b: number): number {\n  return a * b;\n}";
                    (0, vitest_1.expect)(writeSpy.mock.calls[0][0]).toEqual({
                        filePath: buggyFilePath,
                        content: expectedCorrectedCode,
                    });
                    return [2 /*return*/];
            }
        });
    }); }, 60000); // Increase timeout for this very long chain
});
