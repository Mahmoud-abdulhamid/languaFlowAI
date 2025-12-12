const mongoose = require('mongoose');
const { MongoClient } = mongoose.mongo;

// Config
const LOCAL_URI = 'mongodb://localhost:27017';
const DB_NAME = 'tr_system';
// Encoded password: v%25t2hMX!tPkrXz!
const REMOTE_URI = 'mongodb+srv://LinguaFlow:v%25t2hMX!tPkrXz!@cluster0.upgqi4o.mongodb.net/?appName=Cluster0';

async function migrate() {
    console.log('Starting migration...');

    // 1. Connect Local
    const localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    const localDb = localClient.db(DB_NAME);
    console.log('Connected to Local DB');

    // 2. Connect Remote
    const remoteClient = new MongoClient(REMOTE_URI);
    await remoteClient.connect();
    const remoteDb = remoteClient.db(DB_NAME);
    console.log('Connected to Remote DB (Target: tr_system)');

    // 3. Get Collections
    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    for (const colInfo of collections) {
        const colName = colInfo.name;
        if (colName === 'system.profile') continue; // Skip system collections

        console.log(`Migrating ${colName}...`);

        const docs = await localDb.collection(colName).find({}).toArray();
        if (docs.length > 0) {
            try {
                // Optional: clear remote check? No, just append/error on dupes
                const result = await remoteDb.collection(colName).insertMany(docs);
                console.log(`  -> Migrated ${result.insertedCount} documents.`);
            } catch (e) {
                console.log(`  -> Warning: ${e.message.split(' ')[0]}... (likely duplicates)`);
            }
        } else {
            console.log(`  -> Empty collection.`);
        }
    }

    console.log('Migration Complete.');
    await localClient.close();
    await remoteClient.close();
}

migrate().catch(err => console.error('Migration Failed:', err));
