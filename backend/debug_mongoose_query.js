const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Removed invalid require
// I will define the schema inline to mimic strict Mongoose behavior.

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system');
        console.log('Connected');

        const notificationSchema = new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            type: { type: String, required: true },
            title: { type: String, required: true },
            message: { type: String, required: true },
            link: { type: String },
            isRead: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        });

        // Use a different model name to avoid conflicts if I was importing, but here it's fine
        const NotificationModel = mongoose.model('NotificationDebug', notificationSchema, 'notifications');

        const userIdStr = "6935619718afcb3d3cd0e6da";
        // User ID from the notification we found. 
        // Note: 69356197... is 24 chars? 
        // 6935 = 2 bytes? 
        // '6935619718afcb3d3cd0e6da' length is 24. Hex. Valid ObjectId.

        console.log('Testing with UserID:', userIdStr);

        const count = await NotificationModel.countDocuments({ user: userIdStr, isRead: false });
        console.log('Count (String ID):', count);

        const list = await NotificationModel.find({ user: userIdStr }).sort({ createdAt: -1 }).limit(5);
        console.log('List (String ID):', list.length);
        if (list.length > 0) console.log('First Item ID:', list[0]._id);

        const countObj = await NotificationModel.countDocuments({ user: new mongoose.Types.ObjectId(userIdStr), isRead: false });
        console.log('Count (ObjectId):', countObj);

        const listObj = await NotificationModel.find({ user: new mongoose.Types.ObjectId(userIdStr) }).sort({ createdAt: -1 }).limit(5);
        console.log('List (ObjectId):', listObj.length);


        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
