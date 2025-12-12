const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('Connected to DB');

        const notifications = await mongoose.connection.collection('notifications').find({}).toArray();
        console.log('Total Notifications:', notifications.length);
        console.log('Sample Notification:', notifications[0]);

        // Check if there are unread notifications
        const unread = await mongoose.connection.collection('notifications').countDocuments({ isRead: false });
        console.log('Total Unread:', unread);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
