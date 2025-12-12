import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { SystemSetting } from '../models/SystemSetting';
import { User } from '../models/User';

// Backup Directory
const BACKUP_DIR = path.join(__dirname, '../../backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper to get CPU Load (Windows compatible attempt)
const getCpuLoad = (): Promise<number[]> => {
    return new Promise((resolve) => {
        if (os.platform() === 'win32') {
            // Use wmic to get percentage
            exec('wmic cpu get loadpercentage', (error, stdout, stderr) => {
                if (error) return resolve([0, 0, 0]);
                const lines = stdout.trim().split('\n');
                if (lines.length > 1) {
                    const load = parseInt(lines[1].trim());
                    const val = isNaN(load) ? 0 : load;
                    resolve([val, val, val]); // Return as array to match loadavg structure
                } else {
                    resolve([0, 0, 0]);
                }
            });
        } else {
            resolve(os.loadavg());
        }
    });
};

// Get System Stats
export const getSystemStats = async (req: AuthRequest, res: Response) => {
    try {
        const uptime = os.uptime();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const cpuLoad = await getCpuLoad();
        const platform = os.platform();
        const release = os.release();

        const stats = {
            uptime, // seconds
            totalMem, // bytes
            freeMem, // bytes
            usedMem: totalMem - freeMem,
            cpuLoad, // [1, 5, 15] min avg OR [current, current, current] % for Windows
            platform, // 'win32', etc
            release, // version
            cpus: os.cpus().length
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get List of Backups
export const getBackups = async (req: AuthRequest, res: Response) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const backups = files
            .filter(f => f.endsWith('.gz') || f.endsWith('.archive'))
            .map(f => {
                const stats = fs.statSync(path.join(BACKUP_DIR, f));
                return {
                    filename: f,
                    size: stats.size,
                    createdAt: stats.birthtime
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        res.json(backups);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create Backup (mongodump)
export const createBackup = async (req: AuthRequest, res: Response) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.archive`;
        const filepath = path.join(BACKUP_DIR, filename);

        // Ensure mongodump is available or provide full path via env
        // Common paths check not implemented, relying on PATH or Env
        const MONGODUMP_PATH = process.env.MONGODUMP_PATH || 'mongodump';
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/translation-system';

        console.log(`Starting backup to: ${filepath}`);

        // Command for mongodump
        const command = `"${MONGODUMP_PATH}" --uri="${mongoUri}" --archive="${filepath}" --gzip`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error.message}`);
                console.error(`Backup Stderr: ${stderr}`);
                return res.status(500).json({
                    message: 'Backup execution failed',
                    error: error.message,
                    details: stderr
                });
            }

            if (fs.existsSync(filepath)) {
                const stats = fs.statSync(filepath);
                res.json({ message: 'Backup created successfully', filename, size: stats.size });
            } else {
                res.status(500).json({ message: 'Backup command success but file missing' });
            }
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Download Backup
export const downloadBackup = async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(filepath);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Backup
export const deleteBackup = async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(BACKUP_DIR, filename);

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        res.json({ message: 'Backup deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Restore Backup
export const restoreBackup = async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ message: 'Filename required' });

        const filepath = path.join(BACKUP_DIR, filename);
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ message: 'Backup file not found' });
        }

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/translation-system';

        // Command for mongorestore --drop (CAUTION: Drops existing collections)
        const command = `mongorestore --uri="${mongoUri}" --archive="${filepath}" --gzip --drop`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Restore error: ${error.message}`);
                return res.status(500).json({ message: 'Restore failed', error: error.message });
            }
            res.json({ message: 'System restored successfully' });
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Clear Cache (Filesystem Cleanup)
export const clearCache = async (req: AuthRequest, res: Response) => {
    try {
        let deletedCount = 0;
        const tempDirs = [
            path.join(__dirname, '../../uploads/temp'),
            path.join(__dirname, '../../temp')
        ];

        for (const dir of tempDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    try {
                        fs.unlinkSync(path.join(dir, file));
                        deletedCount++;
                    } catch (e) { console.error(`Failed to delete ${file}`, e); }
                }
            }
        }

        res.json({ message: `System cache cleared. Removed ${deletedCount} temporary files.` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Force Logout All Users
export const killAllSessions = async (req: AuthRequest, res: Response) => {
    try {
        // In JWT system, we can't easily invalidate all tokens without a blacklist or changing the secret.
        // A "soft" way is to set a "tokensValidAfter" timestamp on all users.

        // Update all users to require re-login
        // We will need to add a middleware check for this field if we want it to work immediately.
        // For now, let's assume we implement a "global session version" or we just update all users.

        // Simpler implementation: Just update a global key? 
        // Or update a field on User model?

        // Let's create a SystemSetting for "global_min_token_iat" (Issued At)
        await SystemSetting.findOneAndUpdate(
            { key: 'global_min_token_iat' },
            { value: Date.now() / 1000 },
            { upsert: true }
        );

        res.json({ message: 'All users will be logged out on next request check.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
