// src/server.ts
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { resolveToolPath, findProjectRoot } from './tools/path-resolver.js'; // Import findProjectRoot
const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());
app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});
app.post('/api/listFiles', (async (req, res, next) => {
    const { directoryPath } = req.body;
    if (typeof directoryPath !== 'string') {
        return res.status(400).json({ success: false, error: 'directoryPath (string) is required' });
    }
    try {
        const absoluteStartPath = resolveToolPath(directoryPath);
        const projectRoot = findProjectRoot(); // Use the reliable function from path-resolver
        console.log(`[Server] Recursively listing from: ${absoluteStartPath}`);
        const fileList = [];
        async function recursiveList(currentPath) {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                if (['node_modules', '.next', '.git', 'dist'].includes(entry.name))
                    continue;
                // FIX: Correctly calculate the path relative to the true project root
                const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
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
            const absolutePath = resolveToolPath(p);
            const content = await fs.readFile(absolutePath, 'utf-8');
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
        const absolutePath = resolveToolPath(filePath);
        await fs.writeFile(absolutePath, content, 'utf-8');
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
        const absolutePath = resolveToolPath(filePath);
        const originalContent = await fs.readFile(absolutePath, 'utf-8');
        const newContent = originalContent.replaceAll(find, replace);
        await fs.writeFile(absolutePath, newContent, 'utf-8');
        res.status(200).json({ success: true, message: `Successfully performed find and replace in ${filePath}` });
    }
    catch (error) {
        next(error);
    }
}));
app.use((err, req, res, _next) => {
    console.error('[Server] An unhandled error occurred:', err.message);
    res.status(500).json({ success: false, error: err.message || 'An internal server error occurred.' });
});
app.listen(PORT, () => {
    console.log(`Eira's File System Server is running on http://localhost:${PORT}`);
});
