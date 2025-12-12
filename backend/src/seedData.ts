
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Language } from './models/Language';
import { Role } from './models/Role';
import { Project } from './models/Project';
import bcrypt from 'bcryptjs';

dotenv.config();

const languages = [
    { name: 'English', code: 'en', nativeName: 'English', direction: 'ltr' },
    { name: 'Arabic', code: 'ar', nativeName: 'العربية', direction: 'rtl' },
    { name: 'Spanish', code: 'es', nativeName: 'Español', direction: 'ltr' },
    { name: 'French', code: 'fr', nativeName: 'Français', direction: 'ltr' },
    { name: 'German', code: 'de', nativeName: 'Deutsch', direction: 'ltr' },
    { name: 'Chinese', code: 'zh', nativeName: '中文', direction: 'ltr' },
    { name: 'Japanese', code: 'ja', nativeName: '日本語', direction: 'ltr' },
    { name: 'Russian', code: 'ru', nativeName: 'Русский', direction: 'ltr' },
];

const PERMISSIONS = {
    USER_CREATE: 'user.create',
    USER_READ: 'user.read',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',

    PROJECT_CREATE: 'project.create',
    PROJECT_READ: 'project.read',
    PROJECT_UPDATE: 'project.update',
    PROJECT_DELETE: 'project.delete',

    LANGUAGE_MANAGE: 'language.manage',
    ROLE_MANAGE: 'role.manage'
};

const DEFAULT_ROLES = [
    {
        name: 'SUPER_ADMIN',
        description: 'Full System Access',
        permissions: ['*']
    },
    {
        name: 'ADMIN',
        description: 'Administrator',
        permissions: [
            PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE,
            PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_UPDATE, PERMISSIONS.PROJECT_DELETE,
            PERMISSIONS.LANGUAGE_MANAGE
        ]
    },
    {
        name: 'CLIENT',
        description: 'Project Owner',
        permissions: [
            PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_UPDATE
        ]
    },
    {
        name: 'TRANSLATOR',
        description: 'Translation Specialist',
        permissions: [
            PERMISSIONS.PROJECT_READ
        ]
    }
];




// ... (existing code: languages, permissions, roles arrays) ...

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected');

        // 1. Seed Roles
        console.log('Seeding Roles...');
        for (const role of DEFAULT_ROLES) {
            const exists = await Role.findOne({ name: role.name });
            if (!exists) {
                await Role.create(role);
            } else {
                exists.permissions = role.permissions;
                await exists.save();
            }
        }

        // 2. Seed Languages
        console.log('Seeding Languages...');
        for (const lang of languages) {
            const exists = await Language.findOne({ code: lang.code });
            if (!exists) {
                await Language.create(lang);
            }
        }

        // 3. Seed Users
        console.log('Seeding Users...');

        const demoUsers = [
            { name: 'Super Admin', email: 'super@example.com', role: 'SUPER_ADMIN', password: '123456' },
            { name: 'Demo Admin', email: 'admin@example.com', role: 'ADMIN', password: '123456' },
            { name: 'Demo Client', email: 'client@example.com', role: 'CLIENT', password: '123456' },
            { name: 'Demo Translator', email: 'translator@example.com', role: 'TRANSLATOR', languages: [{ source: 'en', target: 'ar' }], password: '123456' },
            { name: 'Sarah Translator (ES)', email: 'sarah@example.com', role: 'TRANSLATOR', languages: [{ source: 'en', target: 'es' }], password: '123456' },
            { name: 'Mike Client', email: 'mike@example.com', role: 'CLIENT', password: '123456' }
        ];

        for (const u of demoUsers) {
            const existingUser = await User.findOne({ email: u.email });
            if (!existingUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await User.create({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    languages: u.languages || []
                });
                console.log(`Created user: ${u.email}`);
            }
        }

        // 4. Seed Projects
        console.log('Seeding Projects...');
        await Project.deleteMany({}); // Clear existing projects
        console.log('Cleared existing projects.');

        // Fetch users to link
        const client = await User.findOne({ email: 'client@example.com' });
        const mike = await User.findOne({ email: 'mike@example.com' });
        const translatorAr = await User.findOne({ email: 'translator@example.com' });
        const translatorEs = await User.findOne({ email: 'sarah@example.com' });

        if (!client || !translatorAr) {
            console.log('Skipping projects: Key users not found (client/translator).');
            process.exit(1);
        }

        const projects = [
            {
                title: 'Legal Contract Translation',
                description: 'Translation of a business service agreement.',
                sourceLang: 'en',
                targetLangs: ['ar'],
                status: 'ACTIVE',
                clientId: client._id,
                budget: 500,
                deadline: new Date(Date.now() + 86400000 * 5) // +5 days
            },
            {
                title: 'Marketing Brochure - Summer Campaign',
                description: 'Creative translation for summer products.',
                sourceLang: 'en',
                targetLangs: ['es'],
                status: 'ACTIVE',
                clientId: client._id,
                assignedTranslators: [translatorEs?._id],
                budget: 1200,
                deadline: new Date(Date.now() + 86400000 * 10)
            },
            {
                title: 'Technical Manual - v2.0',
                description: 'User manual for the new software release.',
                sourceLang: 'en',
                targetLangs: ['fr', 'de'],
                status: 'DRAFT',
                clientId: mike?._id || client._id,
                budget: 3000,
                deadline: new Date(Date.now() + 86400000 * 20)
            },
            {
                title: 'Website Localization',
                description: 'Landing page and about us section.',
                sourceLang: 'en',
                targetLangs: ['ar'],
                status: 'COMPLETED',
                clientId: client._id,
                assignedTranslators: [translatorAr._id],
                budget: 800,
                deadline: new Date(Date.now() - 86400000 * 2) // Past
            },
            {
                title: 'Medical Report',
                description: 'Confidential patient history report.',
                sourceLang: 'en',
                targetLangs: ['ar'],
                status: 'ACTIVE',
                clientId: mike?._id || client._id,
                assignedTranslators: [translatorAr._id],
                budget: 450,
                deadline: new Date(Date.now() + 86400000 * 3)
            },
            {
                title: 'Mobile App Strings',
                description: 'UI strings for iOS app.',
                sourceLang: 'en',
                targetLangs: ['es', 'fr'],
                status: 'ACTIVE',
                clientId: client._id,
                budget: 200,
                deadline: new Date(Date.now() + 86400000 * 7)
            },
            {
                title: 'Financial Statement Q3',
                description: 'Quarterly earnings report.',
                sourceLang: 'en',
                targetLangs: ['zh'],
                status: 'REVIEW',
                clientId: client._id,
                budget: 1500,
                deadline: new Date(Date.now() + 86400000 * 14)
            },
            {
                title: 'Email Newsletter',
                description: 'Monthly updates for subscribers.',
                sourceLang: 'en',
                targetLangs: ['de'],
                status: 'DRAFT',
                clientId: mike?._id || client._id,
                budget: 100,
                deadline: new Date(Date.now() + 86400000 * 2)
            },
            {
                title: 'Employee Handbook',
                description: 'Internal HR policy document.',
                sourceLang: 'en',
                targetLangs: ['es'],
                status: 'ACTIVE',
                clientId: client._id,
                assignedTranslators: [translatorEs?._id],
                budget: 2200,
                deadline: new Date(Date.now() + 86400000 * 15)
            },
            {
                title: 'Product Catalog 2025',
                description: 'Full catalog of new year items.',
                sourceLang: 'en',
                targetLangs: ['ar', 'ru', 'ja'],
                status: 'ACTIVE',
                clientId: client._id,
                budget: 5000,
                deadline: new Date(Date.now() + 86400000 * 30)
            }
        ];

        for (const p of projects) {
            await Project.create(p);
        }
        console.log(`Seeded ${projects.length} projects.`);

        console.log('Seeding Complete! 🌿');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();

