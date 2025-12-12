const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        const user = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6935619718afcb3d3cd0e6da') });
        console.log('User:', user ? user.email : 'Not found');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
