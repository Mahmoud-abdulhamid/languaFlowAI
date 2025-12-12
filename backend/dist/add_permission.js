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
const Role_1 = require("./models/Role");
dotenv_1.default.config();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('MongoDB Connected');
        const rolesToUpdate = ['ADMIN', 'CLIENT', 'TRANSLATOR'];
        for (const roleName of rolesToUpdate) {
            const role = yield Role_1.Role.findOne({ name: roleName });
            if (role) {
                if (!role.permissions.includes('VIEW_PROGRESS')) {
                    role.permissions.push('VIEW_PROGRESS');
                    yield role.save();
                    console.log(`Added VIEW_PROGRESS to ${roleName}`);
                }
                else {
                    console.log(`VIEW_PROGRESS already exists for ${roleName}`);
                }
            }
            else {
                console.log(`Role ${roleName} not found`);
                // Create if missing (basic fallback)
                yield Role_1.Role.create({
                    name: roleName,
                    description: roleName,
                    permissions: ['VIEW_PROGRESS']
                });
                console.log(`Created role ${roleName}`);
            }
        }
        console.log('Permissions updated');
        process.exit();
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
run();
