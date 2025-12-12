
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/translation-system');
        console.log('Connected to DB');

        // Promote specific user or first user to SUPER_ADMIN
        const email = 'admin@example.com';
        const user = await User.findOne({ email });

        if (user) {
            user.role = 'SUPER_ADMIN';
            await user.save();
            console.log(`Promoted ${email} to SUPER_ADMIN`);
        } else {
            console.log('User not found, creating dummy Super Admin not implemented here. Please register first.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promoteUser();
