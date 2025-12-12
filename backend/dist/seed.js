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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User");
const Project_1 = require("./models/Project");
const Segment_1 = require("./models/Segment");
const Role_1 = require("./models/Role");
dotenv_1.default.config();
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
    },
    {
        name: 'Client User',
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT',
        avatar: 'https://ui-avatars.com/api/?name=Client+User&background=6366f1&color=fff'
    },
    {
        name: 'Translator User',
        email: 'translator@example.com',
        password: 'password123',
        role: 'TRANSLATOR',
        avatar: 'https://ui-avatars.com/api/?name=Translator+User&background=db2777&color=fff'
    }
];
const seedDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('MongoDB Connected');
        // Clear existing data
        yield User_1.User.deleteMany({});
        yield Project_1.Project.deleteMany({});
        yield Segment_1.Segment.deleteMany({});
        yield Role_1.Role.deleteMany({});
        console.log('Existing data cleared');
        // Create Roles with Permissions
        const adminPermissions = ['*', 'VIEW_PROGRESS'];
        const clientPermissions = ['CREATE_PROJECT', 'VIEW_PROJECT', 'VIEW_PROGRESS'];
        const translatorPermissions = ['VIEW_PROJECT', 'EDIT_TRANSLATION', 'VIEW_PROGRESS'];
        yield Role_1.Role.create([
            { name: 'ADMIN', description: 'Administrator', permissions: adminPermissions },
            { name: 'CLIENT', description: 'Client', permissions: clientPermissions },
            { name: 'TRANSLATOR', description: 'Translator', permissions: translatorPermissions }
        ]);
        console.log('Roles created');
        // Create Users
        const createdUsers = {};
        for (const user of users) {
            const hashedPassword = yield bcryptjs_1.default.hash(user.password, 10);
            const newUser = yield User_1.User.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
            createdUsers[user.role] = newUser;
        }
        console.log('Users created');
        // Create Projects
        const projectsData = [
            {
                title: 'Marketing Brochure Q4',
                clientId: createdUsers['CLIENT']._id,
                sourceLang: 'en',
                targetLangs: ['ar', 'fr'],
                assignedTranslators: [createdUsers['TRANSLATOR']._id],
                status: 'ACTIVE',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
                files: [{ originalName: 'brochure_q4.pdf', path: 'uploads/mock.pdf', wordCount: 1500 }]
            },
            {
                title: 'Legal Contract v2',
                clientId: createdUsers['CLIENT']._id,
                sourceLang: 'en',
                targetLangs: ['ar'],
                assignedTranslators: [createdUsers['TRANSLATOR']._id],
                status: 'REVIEW',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
                files: [{ originalName: 'contract.docx', path: 'uploads/mock.docx', wordCount: 3000 }]
            },
            {
                title: 'Website Localization',
                clientId: createdUsers['CLIENT']._id,
                sourceLang: 'en',
                targetLangs: ['es', 'de'],
                assignedTranslators: [],
                status: 'DRAFT',
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                files: [{ originalName: 'site_content.json', path: 'uploads/mock.json', wordCount: 5000 }]
            },
            {
                title: 'Annual Report 2024',
                clientId: createdUsers['CLIENT']._id,
                sourceLang: 'en',
                targetLangs: ['ar'],
                assignedTranslators: [createdUsers['TRANSLATOR']._id],
                status: 'COMPLETED',
                deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Past
                files: [{ originalName: 'report_2024.pdf', path: 'uploads/mock.pdf', wordCount: 12000 }]
            }
        ];
        const createdProjects = yield Project_1.Project.insertMany(projectsData);
        console.log('Projects created');
        // Create Segments for Progress
        // Add segments to the first project to simulate progress
        const proj = createdProjects[0];
        const segments = [];
        for (let i = 0; i < 10; i++) {
            segments.push({
                project: proj._id,
                fileIndex: 0,
                sequence: i + 1,
                sourceText: `Source segment ${i}`,
                targetText: i < 5 ? `Translated segment ${i}` : '',
                targetLang: 'ar',
                status: i < 3 ? 'CONFIRMED' : (i < 5 ? 'TRANSLATED' : 'DRAFT')
            });
        }
        yield Segment_1.Segment.insertMany(segments);
        console.log('Segments created');
        console.log('Database seeded successfully');
        process.exit();
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
});
seedDB();
