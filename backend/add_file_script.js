const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb+srv://LinguaFlow:v%25t2hMX!tPkrXz!@cluster0.upgqi4o.mongodb.net/tr_system?appName=Cluster0';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const project = await mongoose.connection.collection('projects').findOne({ title: 'Marketing Brochure - Summer Campaign' });
        if (!project) {
            console.log('Project not found');
            process.exit(1);
        }

        console.log('Found project:', project._id);

        const file = {
            originalName: 'demo_brochure.txt',
            path: 'uploads/demo_brochure.txt',
            wordCount: 150,
            segments: [
                { sequence: 1, sourceText: "Welcome to our summer campaign.", targetText: "", status: "DRAFT" },
                { sequence: 2, sourceText: "Enjoy the best deals of the season.", targetText: "", status: "DRAFT" }
            ]
        };

        // Ensure we don't duplicate if already there (simple check)
        if (!project.files || project.files.length === 0) {
            await mongoose.connection.collection('projects').updateOne(
                { _id: project._id },
                { $set: { files: [file] } }
            );
            console.log('Added file to project');
        } else {
            console.log('Project already has files');
        }

        // Create dummy file
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        fs.writeFileSync(path.join(uploadDir, 'demo_brochure.txt'), 'Welcome to our summer campaign.\nEnjoy the best deals of the season.');
        console.log('Created physical file');

        // Also seed segments collection if the app uses it separate from project.files
        // Checking schemas... usually segments are separate.
        // Let's check Segment model or just assume the app calculates them? 
        // Based on previous controller code: Segment.find({ project: projectId })...
        // So I must insert into 'segments' collection!

        const segments = [
            {
                project: project._id,
                fileIndex: 0,
                sequence: 1,
                sourceText: "Welcome to our summer campaign.",
                targetText: "",
                status: "DRAFT",
                targetLang: "es"
            },
            {
                project: project._id,
                fileIndex: 0,
                sequence: 2,
                sourceText: "Enjoy the best deals of the season.",
                targetText: "",
                status: "DRAFT",
                targetLang: "es"
            }
        ];

        await mongoose.connection.collection('segments').deleteMany({ project: project._id });
        await mongoose.connection.collection('segments').insertMany(segments);
        console.log('Inserted segments');

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
