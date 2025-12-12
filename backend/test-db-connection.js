const mongoose = require('mongoose');

const uri = "mongodb+srv://LinguaFlow:v%t2hMX!tPkrXz!@cluster0.upgqi4o.mongodb.net/?appName=Cluster0";

async function run() {
    try {
        console.log("Attempting to connect with raw URI...");
        await mongoose.connect(uri);
        console.log("SUCCESS: Connected with raw URI!");
        await mongoose.disconnect();
    } catch (error) {
        console.log("FAILED with raw URI:", error.message);

        // Try encoding
        const encodedPass = encodeURIComponent("v%t2hMX!tPkrXz!");
        const encodedUri = `mongodb+srv://LinguaFlow:${encodedPass}@cluster0.upgqi4o.mongodb.net/?appName=Cluster0`;
        console.log("\nAttempting to connect with ENCODED URI...");
        console.log("Encoded URI (hidden pass):", encodedUri.replace(encodedPass, '***'));

        try {
            await mongoose.connect(encodedUri);
            console.log("SUCCESS: Connected with ENCODED URI!");
            await mongoose.disconnect();
        } catch (err2) {
            console.log("FAILED with encoded URI:", err2.message);
        }
    }
}

run();
