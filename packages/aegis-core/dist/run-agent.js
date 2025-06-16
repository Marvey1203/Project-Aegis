"use strict";
// packages/aegis-core/src/run-agent.ts
// Corrected by Eira to align with the final schema.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var langgraph_1 = require("@langchain/langgraph");
var schemas_js_1 = require("./schemas.js");
var uuid_1 = require("uuid");
var agents_js_1 = require("./agents.js");
var readline = require("node:readline/promises");
var node_process_1 = require("node:process");
function delegateTaskNode(state) {
    return __awaiter(this, void 0, void 0, function () {
        var tasks, tasksWithCascadedFailures, currentTasks, readyTaskIndex, currentTask, newTasks, agentOutput, agentInput, fornaxTask, fornaxToolOutput, fornaxOutput, corvusInputPayload, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('\n--- DELEGATION NODE ---');
                    tasks = state.tasks;
                    tasksWithCascadedFailures = tasks.map(function (task) {
                        var _a;
                        if (task.status === 'pending' && ((_a = task.dependencies) === null || _a === void 0 ? void 0 : _a.some(function (depId) { var _a; return ((_a = tasks.find(function (t) { return t.id === depId; })) === null || _a === void 0 ? void 0 : _a.status) === 'failed'; }))) {
                            console.log("Janus: Task \"".concat(task.description, "\" is being marked as failed due to a failed dependency."));
                            return __assign(__assign({}, task), { status: 'failed' });
                        }
                        return task;
                    });
                    currentTasks = tasksWithCascadedFailures;
                    readyTaskIndex = currentTasks.findIndex(function (t) {
                        var _a;
                        if (t.status !== 'pending')
                            return false;
                        return ((_a = t.dependencies) !== null && _a !== void 0 ? _a : []).every(function (depId) { var _a; return ((_a = currentTasks.find(function (dep) { return dep.id === depId; })) === null || _a === void 0 ? void 0 : _a.status) === 'completed'; });
                    });
                    if (readyTaskIndex === -1) {
                        console.log('Janus: No actionable pending tasks. Work complete or blocked.');
                        return [2 /*return*/, __assign(__assign({}, state), { tasks: currentTasks, humanApprovalNeeded: false })];
                    }
                    currentTask = __assign({}, currentTasks[readyTaskIndex]);
                    console.log("Janus: Executing: \"".concat(currentTask.description, "\" for agent ").concat(currentTask.agent, "."));
                    newTasks = __spreadArray([], currentTasks, true);
                    newTasks[readyTaskIndex] = __assign(__assign({}, currentTask), { status: 'in_progress' });
                    agentInput = { input: currentTask.input, chat_history: [] };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 11, , 12]);
                    if (!(currentTask.agent === 'Corvus')) return [3 /*break*/, 3];
                    fornaxTask = newTasks.find(function (t) { return t.id === currentTask.dependencies[0]; });
                    fornaxToolOutput = fornaxTask.output.toolOutput;
                    fornaxOutput = JSON.parse(fornaxToolOutput);
                    corvusInputPayload = __assign(__assign({}, currentTask.input), { orderId: fornaxOutput.orderId, trackingNumber: fornaxOutput.trackingNumber });
                    agentInput = { input: corvusInputPayload, chat_history: [] };
                    return [4 /*yield*/, agents_js_1.corvusExecutor.invoke(agentInput)];
                case 2:
                    agentOutput = _d.sent();
                    return [3 /*break*/, 10];
                case 3:
                    if (!(currentTask.agent === 'Lyra')) return [3 /*break*/, 5];
                    return [4 /*yield*/, agents_js_1.lyraExecutor.invoke(agentInput)];
                case 4:
                    agentOutput = _d.sent();
                    return [3 /*break*/, 10];
                case 5:
                    if (!(currentTask.agent === 'Caelus')) return [3 /*break*/, 7];
                    return [4 /*yield*/, agents_js_1.caelusExecutor.invoke(agentInput)];
                case 6:
                    agentOutput = _d.sent();
                    return [3 /*break*/, 10];
                case 7:
                    if (!(currentTask.agent === 'Fornax')) return [3 /*break*/, 9];
                    return [4 /*yield*/, agents_js_1.fornaxExecutor.invoke(agentInput)];
                case 8:
                    agentOutput = _d.sent();
                    return [3 /*break*/, 10];
                case 9:
                    agentOutput = { output: "No action taken." };
                    _d.label = 10;
                case 10:
                    newTasks[readyTaskIndex] = __assign(__assign({}, newTasks[readyTaskIndex]), { status: 'awaiting_human_approval', output: { agentResponse: agentOutput.output, toolOutput: (_c = (_b = (_a = agentOutput.intermediateSteps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.observation) !== null && _c !== void 0 ? _c : null } });
                    return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks, humanApprovalNeeded: true, systemMessages: __spreadArray(__spreadArray([], state.systemMessages, true), ["Janus: Task \"".concat(currentTask.id, "\" executed. Awaiting approval.")], false) })];
                case 11:
                    error_1 = _d.sent();
                    newTasks[readyTaskIndex] = __assign(__assign({}, newTasks[readyTaskIndex]), { status: 'failed', output: { agentResponse: error_1.message } });
                    return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function humanApprovalGateNode(state) {
    return __awaiter(this, void 0, void 0, function () {
        var taskForApproval, rl, answer, newStatus, approvedTask, newTasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n--- HUMAN APPROVAL GATE ---');
                    taskForApproval = state.tasks.find(function (t) { return t.status === 'awaiting_human_approval'; });
                    if (!taskForApproval)
                        return [2 /*return*/, __assign(__assign({}, state), { humanApprovalNeeded: false })];
                    console.log("Janus: Paused. The following task requires your approval:");
                    console.log("  - Task: ".concat(taskForApproval.description));
                    console.log("--- AGENT OUTPUT ---");
                    console.dir(taskForApproval.output, { depth: null });
                    console.log("--- END AGENT OUTPUT ---");
                    rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
                    return [4 /*yield*/, rl.question('Do you approve this result? (yes/no): ')];
                case 1:
                    answer = _a.sent();
                    rl.close();
                    newStatus = answer.toLowerCase() === 'yes' ? 'completed' : 'failed';
                    approvedTask = __assign(__assign({}, taskForApproval), { status: newStatus });
                    newTasks = state.tasks.map(function (t) { return t.id === approvedTask.id ? approvedTask : t; });
                    return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks, humanApprovalNeeded: false, systemMessages: __spreadArray(__spreadArray([], state.systemMessages, true), ["Human Partner: Task \"".concat(approvedTask.id, "\" was ").concat(newStatus, ".")], false) })];
            }
        });
    });
}
function routeTasks(state) {
    console.log('\n--- ROUTING ---');
    if (state.humanApprovalNeeded)
        return 'human_approval_gate';
    var hasPendingTasks = state.tasks.some(function (t) {
        var _a;
        if (t.status !== 'pending')
            return false;
        return ((_a = t.dependencies) !== null && _a !== void 0 ? _a : []).every(function (depId) { var _a; return ((_a = state.tasks.find(function (dep) { return dep.id === depId; })) === null || _a === void 0 ? void 0 : _a.status) === 'completed'; });
    });
    if (hasPendingTasks)
        return 'delegate_task';
    console.log('All tasks resolved. Routing to __end__.');
    return langgraph_1.END;
}
var workflow = new langgraph_1.StateGraph({ channels: schemas_js_1.graphState })
    .addNode('delegate_task', delegateTaskNode)
    .addNode('human_approval_gate', humanApprovalGateNode)
    .addEdge(langgraph_1.START, 'delegate_task')
    .addConditionalEdges('delegate_task', routeTasks);
var app = workflow.compile();
console.log('Aegis workflow compiled successfully.');
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var lyraTaskId, caelusTaskId, fornaxTaskId, lyraTask, caelusTask, fornaxTask, corvusTask, initialState, _a, _b, _c, event_1, e_1_1;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log('\nStarting a new run of the Aegis system...');
                    lyraTaskId = (0, uuid_1.v4)();
                    caelusTaskId = (0, uuid_1.v4)();
                    fornaxTaskId = (0, uuid_1.v4)();
                    lyraTask = { id: lyraTaskId, description: 'Research the market for high-end, artisanal coffee beans.', agent: 'Lyra', input: { input: 'market trends for single-origin, specialty coffee beans' }, status: 'pending', dependencies: [] };
                    caelusTask = { id: caelusTaskId, description: 'Create a Facebook ad for a new artisanal coffee product.', agent: 'Caelus', input: { productName: "Aegis Gold Roast", productDescription: "An exclusive, single-origin coffee bean...", targetPlatform: 'Facebook' }, status: 'pending', dependencies: [lyraTaskId] };
                    fornaxTask = { id: fornaxTaskId, description: 'Process a new customer order for Aegis Gold Roast.', agent: 'Fornax', input: { productName: "Aegis Gold Roast", productSku: "AGR-001", quantity: 2, customerName: "John Doe", shippingAddress: "123 Main St, Anytown, USA 12345" }, status: 'pending', dependencies: [caelusTaskId] };
                    corvusTask = { id: (0, uuid_1.v4)(), description: 'Send a shipping confirmation email to the customer.', agent: 'Corvus', input: { customerName: "John", customerEmail: "j.doe@example.com" }, status: 'pending', dependencies: [fornaxTaskId] };
                    initialState = {
                        tasks: [lyraTask, caelusTask, fornaxTask, corvusTask],
                        systemMessages: ["Initiating run."],
                        humanApprovalNeeded: false,
                    };
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 7, 8, 13]);
                    _a = true;
                    return [4 /*yield*/, app.stream(initialState, { recursionLimit: 100 })];
                case 2:
                    _b = __asyncValues.apply(void 0, [_g.sent()]);
                    _g.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    _f = _c.value;
                    _a = false;
                    event_1 = _f;
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    console.log("\n--- Run Complete ---");
                    return [2 /*return*/];
            }
        });
    });
}
main();
