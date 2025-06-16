"use strict";
// packages/aegis-core/src/server.ts
// Final Definitive Refactoring by Eira
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
var express_1 = require("express");
var http_1 = require("http");
var ws_1 = require("ws");
var cors_1 = require("cors");
var langgraph_1 = require("@langchain/langgraph");
var schemas_js_1 = require("./schemas.js");
var uuid_1 = require("uuid");
var agents_js_1 = require("./agents.js");
var expressApp = (0, express_1.default)();
expressApp.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
expressApp.use(express_1.default.json());
var server = http_1.default.createServer(expressApp);
var wss = new ws_1.WebSocketServer({ server: server });
var PORT = process.env.PORT || 8080;
var clients = new Map();
var workflowApprovalPromises = new Map();
wss.on('connection', function (ws) {
    var clientId = (0, uuid_1.v4)();
    clients.set(clientId, ws);
    console.log("Client ".concat(clientId, " connected"));
    ws.on('message', function (message) {
        var _a;
        try {
            var data = JSON.parse(message.toString());
            if (data.type === 'human:response' && workflowApprovalPromises.has(data.workflowId)) {
                (_a = workflowApprovalPromises.get(data.workflowId)) === null || _a === void 0 ? void 0 : _a(data.decision);
                workflowApprovalPromises.delete(data.workflowId);
            }
        }
        catch (e) {
            console.error('Failed to parse incoming WebSocket message:', e);
        }
    });
    ws.on('close', function () { clients.delete(clientId); });
});
function broadcast(message) {
    var data = JSON.stringify(message);
    clients.forEach(function (client) {
        if (client.readyState === ws_1.WebSocket.OPEN)
            client.send(data);
    });
}
// ==============================================================================
// --- AGENT GRAPH LOGIC (Simplified and Corrected) ---
// ==============================================================================
function delegateTaskNode(state, config) {
    return __awaiter(this, void 0, void 0, function () {
        var workflowId, tasks, readyTask, taskIndex, newTasks, resolvedInput, dynamicInputFn, agentInput, agentMap, agentExecutor, agentOutput, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // --- STEP 1: THE DIAGNOSTIC LOG ---
                    // Let's see the exact state the node is receiving.
                    console.log("--- RAW STATE RECEIVED BY DELEGATION NODE ---");
                    console.dir(state, { depth: null });
                    console.log("-------------------------------------------");
                    workflowId = (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.runId;
                    broadcast({ type: 'log', workflowId: workflowId, message: "--- DELEGATION NODE ---" });
                    tasks = state.tasks;
                    readyTask = tasks.find(function (task) {
                        var _a;
                        if (task.status !== 'pending') {
                            return false;
                        }
                        var dependencies = (_a = task.dependencies) !== null && _a !== void 0 ? _a : [];
                        if (dependencies.length === 0) {
                            return true;
                        }
                        return dependencies.every(function (depId) {
                            var dependencyTask = tasks.find(function (t) { return t.id === depId; });
                            return (dependencyTask === null || dependencyTask === void 0 ? void 0 : dependencyTask.status) === 'completed';
                        });
                    });
                    if (!readyTask) {
                        broadcast({ type: 'log', workflowId: workflowId, message: 'Janus: No actionable pending tasks.' });
                        return [2 /*return*/, __assign(__assign({}, state), { humanApprovalNeeded: false })];
                    }
                    taskIndex = tasks.findIndex(function (t) { return t.id === readyTask.id; });
                    newTasks = __spreadArray([], tasks, true);
                    newTasks[taskIndex] = __assign(__assign({}, readyTask), { status: 'in_progress' });
                    broadcast({ type: 'log', workflowId: workflowId, message: "Janus: Executing: \"".concat(readyTask.description, "\" for agent ").concat(readyTask.agent, ".") });
                    try {
                        if (typeof readyTask.input === 'string' && readyTask.input.trim().startsWith('(state) =>')) {
                            dynamicInputFn = new Function('state', "return (".concat(readyTask.input, ")(state);"));
                            resolvedInput = dynamicInputFn(__assign(__assign({}, state), { tasks: newTasks }));
                        }
                        else {
                            resolvedInput = readyTask.input;
                        }
                    }
                    catch (e) {
                        newTasks[taskIndex] = __assign(__assign({}, newTasks[taskIndex]), { status: 'failed', output: { agentResponse: "Failed to resolve dynamic input: ".concat(e.message) } });
                        return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks })];
                    }
                    agentInput = { input: resolvedInput, chat_history: [] };
                    agentMap = { 'Lyra': agents_js_1.lyraExecutor, 'Caelus': agents_js_1.caelusExecutor, 'Fornax': agents_js_1.fornaxExecutor, 'Corvus': agents_js_1.corvusExecutor };
                    agentExecutor = agentMap[readyTask.agent];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, agentExecutor.invoke(agentInput, config)];
                case 2:
                    agentOutput = _b.sent();
                    newTasks[taskIndex] = __assign(__assign({}, newTasks[taskIndex]), { status: 'awaiting_human_approval', output: { agentResponse: agentOutput.output } });
                    return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks, humanApprovalNeeded: true })];
                case 3:
                    error_1 = _b.sent();
                    newTasks[taskIndex] = __assign(__assign({}, newTasks[taskIndex]), { status: 'failed', output: { agentResponse: "Agent ".concat(readyTask.agent, " failed: ").concat(error_1.message) } });
                    return [2 /*return*/, __assign(__assign({}, state), { tasks: newTasks })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function humanApprovalGateNode(state, config) {
    return __awaiter(this, void 0, void 0, function () {
        var workflowId, taskForApproval, decision, newStatus, updatedTasks;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    workflowId = (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.runId;
                    taskForApproval = state.tasks.find(function (t) { return t.status === 'awaiting_human_approval'; });
                    if (!taskForApproval)
                        return [2 /*return*/, __assign(__assign({}, state), { humanApprovalNeeded: false })];
                    broadcast({ type: 'gate:approval_required', workflowId: workflowId, task: taskForApproval });
                    return [4 /*yield*/, new Promise(function (resolve) { workflowApprovalPromises.set(workflowId, resolve); })];
                case 1:
                    decision = _b.sent();
                    newStatus = decision.toLowerCase() === 'approve' ? 'completed' : 'failed';
                    updatedTasks = state.tasks.map(function (t) { return t.id === taskForApproval.id ? __assign(__assign({}, t), { status: newStatus }) : t; });
                    broadcast({ type: 'log', workflowId: workflowId, message: "Human Partner: Task \"".concat(taskForApproval.description, "\" was ").concat(newStatus, ".") });
                    return [2 /*return*/, { tasks: updatedTasks, humanApprovalNeeded: false }];
            }
        });
    });
}
function routeTasks(state) {
    if (state.humanApprovalNeeded)
        return "human_approval_gate";
    var hasPendingTasks = state.tasks.some(function (t) {
        var _a;
        return t.status === 'pending' &&
            ((_a = t.dependencies) !== null && _a !== void 0 ? _a : []).every(function (depId) { var _a; return ((_a = state.tasks.find(function (dep) { return dep.id === depId; })) === null || _a === void 0 ? void 0 : _a.status) === 'completed'; });
    });
    if (hasPendingTasks)
        return "delegate_task";
    return langgraph_1.END;
}
var agentWorkflow = new langgraph_1.StateGraph({ channels: schemas_js_1.graphState })
    .addNode('delegate_task', delegateTaskNode)
    .addNode('human_approval_gate', humanApprovalGateNode)
    .addEdge(langgraph_1.START, 'delegate_task')
    .addConditionalEdges('delegate_task', routeTasks)
    .addEdge('human_approval_gate', 'delegate_task')
    .compile();
console.log('Aegis workflow compiled successfully.');
var asyncHandler = function (fn) { return function (req, res, next) { Promise.resolve(fn(req, res, next)).catch(next); }; };
var handleStartWorkflow = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var initialTasks, workflowId, initialState;
    return __generator(this, function (_a) {
        console.log('Received request to start workflow.');
        initialTasks = req.body.initialTasks;
        if (!initialTasks || !Array.isArray(initialTasks)) {
            return [2 /*return*/, res.status(400).json({ error: 'initialTasks array is required.' })];
        }
        workflowId = "run-".concat((0, uuid_1.v4)());
        initialState = {
            tasks: initialTasks,
            systemMessages: [],
            humanApprovalNeeded: false,
        };
        res.status(202).json({ workflowId: workflowId, message: "Workflow accepted and initiated." });
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, _c, event_1, e_1_1, e_2;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 14, , 15]);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 7, 8, 13]);
                        _a = true;
                        return [4 /*yield*/, agentWorkflow.stream(initialState, { recursionLimit: 100, configurable: { runId: workflowId } })];
                    case 2:
                        _b = __asyncValues.apply(void 0, [_g.sent()]);
                        _g.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                        _f = _c.value;
                        _a = false;
                        event_1 = _f;
                        broadcast({ type: 'state:update', workflowId: workflowId, data: event_1 });
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
                        broadcast({ type: 'workflow:end', workflowId: workflowId, message: 'Run Complete' });
                        console.log("\n--- Run ".concat(workflowId, " Complete ---"));
                        return [3 /*break*/, 15];
                    case 14:
                        e_2 = _g.sent();
                        console.error("Workflow ".concat(workflowId, " stream error:"), e_2);
                        broadcast({ type: 'workflow:error', workflowId: workflowId, error: e_2.message });
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        }); })();
        return [2 /*return*/];
    });
}); };
expressApp.post('/api/v1/workflow/start', asyncHandler(handleStartWorkflow));
server.listen(PORT, function () { console.log("Aegis Core server listening on http://localhost:".concat(PORT)); });
