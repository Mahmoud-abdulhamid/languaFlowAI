import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from './models/Role';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('MongoDB Connected');

        const rolesToUpdate = ['ADMIN', 'CLIENT', 'TRANSLATOR'];

        for (const roleName of rolesToUpdate) {
            const role = await Role.findOne({ name: roleName });
            if (role) {
                if (!role.permissions.includes('VIEW_PROGRESS')) {
                    role.permissions.push('VIEW_PROGRESS');
                    await role.save();
                    console.log(`Added VIEW_PROGRESS to ${roleName}`);
                } else {
                    console.log(`VIEW_PROGRESS already exists for ${roleName}`);
                }
            } else {
                console.log(`Role ${roleName} not found`);
                // Create if missing (basic fallback)
                await Role.create({
                    name: roleName,
                    description: roleName,
                    permissions: ['VIEW_PROGRESS']
                });
                console.log(`Created role ${roleName}`);
            }
        }

        console.log('Permissions updated');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
