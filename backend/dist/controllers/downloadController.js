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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTranslatedFile = exports.downloadDeliverable = exports.downloadProjectFiles = void 0;
const Project_1 = require("../models/Project");
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Segment_1 = require("../models/Segment");
const downloadProjectFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield Project_1.Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        // Authorization: Admin, Client (Owner), or Assigned Translator
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);
        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to download files for this project' });
        }
        const archive = (0, archiver_1.default)('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        res.attachment(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_files.zip`);
        archive.pipe(res);
        // Add files from project
        for (const file of project.files) {
            // Use 'path' as per schema, fallback to 'storagePath' if legacy data exists
            const fileLocation = file.path || file.storagePath;
            if (!fileLocation) {
                console.warn(`File path missing for ${file.originalName}`);
                continue;
            }
            const filePath = path_1.default.resolve(fileLocation);
            if (fs_1.default.existsSync(filePath)) {
                archive.file(filePath, { name: file.originalName });
            }
            else {
                console.warn(`File not found: ${filePath}`);
                // Optional: Allow download to continue even if a file is missing?
                // For now, valid files will be added.
            }
        }
        yield archive.finalize();
    }
    catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate download' });
        }
    }
});
exports.downloadProjectFiles = downloadProjectFiles;
const downloadDeliverable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fileId } = req.params;
        const project = yield Project_1.Project.findById(id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);
        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to download files for this project' });
        }
        // @ts-ignore
        const deliverable = project.deliverables.find((d) => d._id.toString() === fileId);
        if (!deliverable)
            return res.status(404).json({ message: 'File not found' });
        if (!deliverable.path || !deliverable.name) {
            return res.status(400).json({ message: 'Invalid deliverable file record' });
        }
        const filePath = path_1.default.resolve(deliverable.path);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ message: 'File on disk not found' });
        }
        res.download(filePath, deliverable.name);
    }
    catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to download file' });
        }
    }
});
exports.downloadDeliverable = downloadDeliverable;
const exportTranslatedFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fileId } = req.params;
        const { targetLang } = req.query;
        const project = yield Project_1.Project.findById(id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        // Authorization
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
        const isOwner = project.clientId.toString() === req.user.id;
        // @ts-ignore
        const isAssigned = project.assignedTranslators.includes(req.user.id);
        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to export files for this project' });
        }
        const fileIndex = parseInt(fileId);
        // @ts-ignore
        const file = project.files[fileIndex];
        if (!file)
            return res.status(404).json({ message: 'File not found' });
        const activeLang = targetLang || (project.targetLangs && project.targetLangs[0]) || 'en';
        const segments = yield Segment_1.Segment.find({
            project: id,
            fileIndex: fileIndex,
            targetLang: activeLang
        }).sort({ sequence: 1 });
        if (!segments || segments.length === 0) {
            return res.status(404).json({ message: 'No translation segments found' });
        }
        const content = segments.map(s => s.targetText || s.sourceText).join('\n'); // Fallback
        const originalExt = path_1.default.extname(file.originalName || '');
        const baseName = path_1.default.basename(file.originalName || '', originalExt);
        // Format: [ProjectTitle]-[OriginalName]-[Timestamp]-[Lang].txt
        const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${sanitizedTitle}-${baseName}-${timestamp}-${activeLang}.txt`;
        res.attachment(fileName);
        res.set('Content-Type', 'text/plain');
        res.send(content);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Failed to export file' });
    }
});
exports.exportTranslatedFile = exportTranslatedFile;
