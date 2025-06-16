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
// packages/eira-dev-agent/src/test/eira.test.ts
require("dotenv/config");
var eiraAgent_1 = require("../agent/eiraAgent");
function testEiraCodeImprovement() {
    return __awaiter(this, void 0, void 0, function () {
        var eira, filePath, instruction, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Initializing Eira Agent...");
                    return [4 /*yield*/, eiraAgent_1.EiraAgent.create()];
                case 1:
                    eira = _a.sent();
                    filePath = "core/cj-client.ts";
                    instruction = "\n    The Lyra agent's 'getSupplierDataTool' is failing due to issues with the CJDropshipping API.\n    The tool's implementation is in 'cj-client.ts' within the 'getCJProducts' function.\n    The logs show a '429' rate-limiting error with the message \"Too much request, QPS limit is 1 time/300 seconds\".\n\n    Your task is to modify the 'getCJProducts' function in '".concat(filePath, "' to be more resilient.\n    1.  Wrap the primary API call logic in a try...catch block.\n    2.  If you catch an error, check if the error is an axios error with a response status of 429.\n    3.  If it is a 429 error, log a \"Rate limit hit. Waiting for 301 seconds...\" message to the console.\n    4.  Then, wait for 301 seconds before making one final retry of the API call.\n    5.  If any other error occurs, or the retry fails, it should throw the error so the agent knows the tool failed.\n  ");
                    console.log("Running Eira with the following instruction:\n---".concat(instruction, "\n---"));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, eira.improveFile(filePath, instruction)];
                case 3:
                    response = _a.sent();
                    console.log("\nEira's Response:\n", response);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("An error occurred while running the Eira agent:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
testEiraCodeImprovement();
