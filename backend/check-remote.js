const mongoose = require('mongoose');

// URI from .env (replicated here for script)
const REMOTE_URI = 'mongodb+srv://LinguaFlow:v%25t2hMX!tPkrXz!@cluster0.upgqi4o.mongodb.net/tr_system?appName=Cluster0';

async function check() {
    console.log('Connecting to:', REMOTE_URI.split('@')[1]); // Hide credentials
    try {
        await mongoose.connect(REMOTE_URI);
        console.log('Connected!');

        const cols = await mongoose.connection.db.listCollections().toArray();
        console.log(`Collections found: ${cols.length}`);

        for (const col of cols) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count}`);
        }
    } catch (e) {
        console.error('Connection Failed:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

check();
