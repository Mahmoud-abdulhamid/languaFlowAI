const mongoose = require('mongoose');
require('dotenv').config();
// const { Role } = require('./src/models/Role'); // Removed to avoid TS/JS import issues

// Fix for models if running with ts-node or node directly
const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    permissions: [String]
}, { timestamps: true });

const RoleModel = mongoose.models.Role || mongoose.model('Role', roleSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('Connected to MongoDB');

        // 1. Identify all permissions
        // Aggregating from what we saw in seed.ts + common ones
        const allPermissions = [
            '*',
            'VIEW_PROGRESS',
            'CREATE_PROJECT',
            'VIEW_PROJECT',
            'EDIT_PROJECT',
            'DELETE_PROJECT',
            'ASSIGN_TRANSLATOR',
            'EDIT_TRANSLATION',
            'MANAGE_USERS',
            'MANAGE_ROLES',
            'MANAGE_SETTINGS'
        ];

        // 2. Find or Create SUPER_ADMIN Role
        let superAdminRole = await RoleModel.findOne({ name: 'SUPER_ADMIN' });
        if (!superAdminRole) {
            console.log('Creating SUPER_ADMIN role...');
            superAdminRole = await RoleModel.create({
                name: 'SUPER_ADMIN',
                description: 'Super Administrator with full access',
                permissions: [] // Will set below
            });
        }

        // 3. Grant All Permissions
        // We use a Set to avoid duplicates if merging with existing
        const newPerms = new Set([...superAdminRole.permissions, ...allPermissions]);
        superAdminRole.permissions = Array.from(newPerms);
        await superAdminRole.save();

        console.log('------------------------------------------------');
        console.log('Updated SUPER_ADMIN Role Permissions:');
        console.log('------------------------------------------------');
        console.log(JSON.stringify(superAdminRole.permissions, null, 2));
        console.log('------------------------------------------------');
        console.log('Protection Status: SUPER_ADMIN accounts are protected from deletion via API.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
