
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedSettings } from '../controllers/settingController';

dotenv.config();

const runSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to DB');
        await seedSettings();
        console.log('Settings Seeded');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runSeed();
