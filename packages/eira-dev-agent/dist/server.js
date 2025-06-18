"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const path_resolver_1 = require("./tools/path-resolver"); // Import findProjectRoot
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});
app.post('/api/listFiles', (async (req, res, next) => {
    const { directoryPath } = req.body;
    if (typeof directoryPath !== 'string') {
        return res.status(400).json({ success: false, error: 'directoryPath (string) is required' });
    }
    try {
        const absoluteStartPath = (0, path_resolver_1.resolveToolPath)(directoryPath);
        const projectRoot = (0, path_resolver_1.findProjectRoot)(); // Use the reliable function from path-resolver
        console.log(`[Server] Recursively listing from: ${absoluteStartPath}`);
        const fileList = [];
        async function recursiveList(currentPath) {
            const entries = await promises_1.default.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(currentPath, entry.name);
                if (['node_modules', '.next', '.git', 'dist'].includes(entry.name))
                    continue;
                // FIX: Correctly calculate the path relative to the true project root
                const relativePath = path_1.default.relative(projectRoot, fullPath).replace(/\\/g, '/');
                fileList.push(relativePath);
                if (entry.isDirectory()) {
                    // We add a separator to the file list for directories, but don't add it to the path for recursion
                    if (!fileList.includes(relativePath + '/')) {
                        const index = fileList.indexOf(relativePath);
                        if (index !== -1)
                            fileList[index] = relativePath + '/';
                    }
                    await recursiveList(fullPath);
                }
            }
        }
        await recursiveList(absoluteStartPath);
        res.status(200).json({ success: true, files: fileList });
    }
    catch (error) {
        next(error);
    }
}));
// The rest of the endpoints are correct and do not need changes.
app.post('/api/readFiles', (async (req, res, next) => {
    const { filePaths } = req.body;
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
        return res.status(400).json({ success: false, error: 'filePaths (array) is required' });
    }
    try {
        const contents = await Promise.all(filePaths.map(async (p) => {
            const absolutePath = (0, path_resolver_1.resolveToolPath)(p);
            const content = await promises_1.default.readFile(absolutePath, 'utf-8');
            return { filePath: p, content };
        }));
        res.status(200).json({ success: true, files: contents });
    }
    catch (error) {
        next(error);
    }
}));
app.post('/api/writeFile', (async (req, res, next) => {
    const { filePath, content } = req.body;
    if (typeof filePath !== 'string' || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: 'filePath (string) and content (string) are required' });
    }
    try {
        const absolutePath = (0, path_resolver_1.resolveToolPath)(filePath);
        await promises_1.default.writeFile(absolutePath, content, 'utf-8');
        res.status(200).json({ success: true, message: `Successfully wrote to ${filePath}` });
    }
    catch (error) {
        next(error);
    }
}));
app.post('/api/findAndReplace', (async (req, res, next) => {
    const { filePath, find, replace } = req.body;
    if (typeof filePath !== 'string' || typeof find !== 'string' || typeof replace !== 'string') {
        return res.status(400).json({ success: false, error: 'filePath, find, and replace (all strings) are required' });
    }
    try {
        const absolutePath = (0, path_resolver_1.resolveToolPath)(filePath);
        const originalContent = await promises_1.default.readFile(absolutePath, 'utf-8');
        const newContent = originalContent.replaceAll(find, replace);
        await promises_1.default.writeFile(absolutePath, newContent, 'utf-8');
        res.status(200).json({ success: true, message: `Successfully performed find and replace in ${filePath}` });
    }
    catch (error) {
        next(error);
    }
}));
app.use((err, req, res, next) => {
    console.error('[Server] An unhandled error occurred:', err.message);
    res.status(500).json({ success: false, error: err.message || 'An internal server error occurred.' });
});
app.listen(PORT, () => {
    console.log(`Eira's File System Server is running on http://localhost:${PORT}`);
});
