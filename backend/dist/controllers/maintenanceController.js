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
exports.killAllSessions = exports.clearCache = exports.restoreBackup = exports.deleteBackup = exports.downloadBackup = exports.createBackup = exports.getBackups = exports.getSystemStats = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const SystemSetting_1 = require("../models/SystemSetting");
// Backup Directory
const BACKUP_DIR = path_1.default.join(__dirname, '../../backups');
if (!fs_1.default.existsSync(BACKUP_DIR)) {
    fs_1.default.mkdirSync(BACKUP_DIR, { recursive: true });
}
// Helper to get CPU Load (Windows compatible attempt)
const getCpuLoad = () => {
    return new Promise((resolve) => {
        if (os_1.default.platform() === 'win32') {
            // Use wmic to get percentage
            (0, child_process_1.exec)('wmic cpu get loadpercentage', (error, stdout, stderr) => {
                if (error)
                    return resolve([0, 0, 0]);
                const lines = stdout.trim().split('\n');
                if (lines.length > 1) {
                    const load = parseInt(lines[1].trim());
                    const val = isNaN(load) ? 0 : load;
                    resolve([val, val, val]); // Return as array to match loadavg structure
                }
                else {
                    resolve([0, 0, 0]);
                }
            });
        }
        else {
            resolve(os_1.default.loadavg());
        }
    });
};
// Get System Stats
const getSystemStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uptime = os_1.default.uptime();
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const cpuLoad = yield getCpuLoad();
        const platform = os_1.default.platform();
        const release = os_1.default.release();
        const stats = {
            uptime, // seconds
            totalMem, // bytes
            freeMem, // bytes
            usedMem: totalMem - freeMem,
            cpuLoad, // [1, 5, 15] min avg OR [current, current, current] % for Windows
            platform, // 'win32', etc
            release, // version
            cpus: os_1.default.cpus().length
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSystemStats = getSystemStats;
// Get List of Backups
const getBackups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = fs_1.default.readdirSync(BACKUP_DIR);
        const backups = files
            .filter(f => f.endsWith('.gz') || f.endsWith('.archive'))
            .map(f => {
            const stats = fs_1.default.statSync(path_1.default.join(BACKUP_DIR, f));
            return {
                filename: f,
                size: stats.size,
                createdAt: stats.birthtime
            };
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        res.json(backups);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getBackups = getBackups;
// Create Backup (mongodump)
const createBackup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.archive`;
        const filepath = path_1.default.join(BACKUP_DIR, filename);
        // Ensure mongodump is available or provide full path via env
        // Common paths check not implemented, relying on PATH or Env
        const MONGODUMP_PATH = process.env.MONGODUMP_PATH || 'mongodump';
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/translation-system';
        console.log(`Starting backup to: ${filepath}`);
        // Command for mongodump
        const command = `"${MONGODUMP_PATH}" --uri="${mongoUri}" --archive="${filepath}" --gzip`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error.message}`);
                console.error(`Backup Stderr: ${stderr}`);
                return res.status(500).json({
                    message: 'Backup execution failed',
                    error: error.message,
                    details: stderr
                });
            }
            if (fs_1.default.existsSync(filepath)) {
                const stats = fs_1.default.statSync(filepath);
                res.json({ message: 'Backup created successfully', filename, size: stats.size });
            }
            else {
                res.status(500).json({ message: 'Backup command success but file missing' });
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createBackup = createBackup;
// Download Backup
const downloadBackup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.params;
        const filepath = path_1.default.join(BACKUP_DIR, filename);
        if (!fs_1.default.existsSync(filepath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.download(filepath);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.downloadBackup = downloadBackup;
// Delete Backup
const deleteBackup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.params;
        const filepath = path_1.default.join(BACKUP_DIR, filename);
        if (fs_1.default.existsSync(filepath)) {
            fs_1.default.unlinkSync(filepath);
        }
        res.json({ message: 'Backup deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteBackup = deleteBackup;
// Restore Backup
const restoreBackup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.body;
        if (!filename)
            return res.status(400).json({ message: 'Filename required' });
        const filepath = path_1.default.join(BACKUP_DIR, filename);
        if (!fs_1.default.existsSync(filepath)) {
            return res.status(404).json({ message: 'Backup file not found' });
        }
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/translation-system';
        // Command for mongorestore --drop (CAUTION: Drops existing collections)
        const command = `mongorestore --uri="${mongoUri}" --archive="${filepath}" --gzip --drop`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Restore error: ${error.message}`);
                return res.status(500).json({ message: 'Restore failed', error: error.message });
            }
            res.json({ message: 'System restored successfully' });
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.restoreBackup = restoreBackup;
// Clear Cache (Filesystem Cleanup)
const clearCache = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let deletedCount = 0;
        const tempDirs = [
            path_1.default.join(__dirname, '../../uploads/temp'),
            path_1.default.join(__dirname, '../../temp')
        ];
        for (const dir of tempDirs) {
            if (fs_1.default.existsSync(dir)) {
                const files = fs_1.default.readdirSync(dir);
                for (const file of files) {
                    try {
                        fs_1.default.unlinkSync(path_1.default.join(dir, file));
                        deletedCount++;
                    }
                    catch (e) {
                        console.error(`Failed to delete ${file}`, e);
                    }
                }
            }
        }
        res.json({ message: `System cache cleared. Removed ${deletedCount} temporary files.` });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.clearCache = clearCache;
// Force Logout All Users
const killAllSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In JWT system, we can't easily invalidate all tokens without a blacklist or changing the secret.
        // A "soft" way is to set a "tokensValidAfter" timestamp on all users.
        // Update all users to require re-login
        // We will need to add a middleware check for this field if we want it to work immediately.
        // For now, let's assume we implement a "global session version" or we just update all users.
        // Simpler implementation: Just update a global key? 
        // Or update a field on User model?
        // Let's create a SystemSetting for "global_min_token_iat" (Issued At)
        yield SystemSetting_1.SystemSetting.findOneAndUpdate({ key: 'global_min_token_iat' }, { value: Date.now() / 1000 }, { upsert: true });
        res.json({ message: 'All users will be logged out on next request check.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.killAllSessions = killAllSessions;
