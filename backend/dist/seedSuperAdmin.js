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
const User_1 = require("./models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        const email = 'super@example.com';
        const password = '123456';
        const name = 'Super Admin';
        const role = 'SUPER_ADMIN';
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            console.log('Super Admin already exists. Updating role...');
            existingUser.role = role;
            // Optional: Reset password if you want to enforce the demo password
            // const salt = await bcrypt.genSalt(10);
            // existingUser.password = await bcrypt.hash(password, salt);
            yield existingUser.save();
            console.log('User updated to SUPER_ADMIN');
        }
        else {
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            yield User_1.User.create({
                name,
                email,
                password: hashedPassword,
                role
            });
            console.log('Super Admin created successfully');
        }
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
seedSuperAdmin();
