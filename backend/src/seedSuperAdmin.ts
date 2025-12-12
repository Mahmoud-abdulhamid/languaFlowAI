
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected');

        const email = 'super@example.com';
        const password = '123456';
        const name = 'Super Admin';
        const role = 'SUPER_ADMIN';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Super Admin already exists. Updating role...');
            existingUser.role = role;
            // Optional: Reset password if you want to enforce the demo password
            // const salt = await bcrypt.genSalt(10);
            // existingUser.password = await bcrypt.hash(password, salt);
            await existingUser.save();
            console.log('User updated to SUPER_ADMIN');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                password: hashedPassword,
                role
            });
            console.log('Super Admin created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSuperAdmin();
