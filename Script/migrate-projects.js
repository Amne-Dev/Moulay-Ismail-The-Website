// scripts/migrate-projects.js
// Run this script to migrate existing static projects data to the database

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Static projects data from the original projects.js file
const staticProjects = {
    theory: [
        { title: "A new Vision for Designing Student's Time-Table at School", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Aya%20Hammi%20Mly%20ismail.docx", name: "Aya Hammi", image: "https://placehold.co/150" },
        { title: "A New Vision for Fighting Bullying at School", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Boufaris%20Sara%20Mly%20ismail.docx", name: "Boufaris Sara", image: "https://placehold.co/150" },
        { title: "A new vision to convert the student's footsteps at school into electricity", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Boulangas%20Kaoutar%20Mly%20ismail.docx", name: "Boulangas Kaoutar", image: "https://placehold.co/150" },
        { title: "Student's Engagement in Community Service Projects", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Elbaraka%20Fares%20Mly%20ismail.docx", name: "Elbaraka Fares", image: "https://placehold.co/150" },
        { title: "Quality of Education in Morocco: Between theory and practice", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Fatima%20Zahra%20Ben%20Daouia%20Mly%20ismail.docx", name: "Fatima Zahra Ben Daouia", image: "https://placehold.co/150" },
        { title: "A New Vision for Sustainable Education", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Firdaws%20Idrissi%20Mly%20ismail.docx", name: "Firdaws Idrissi", image: "https://placehold.co/150" },
        { title: "Energy Storage Solutions: Electromagnetism for Developing Efficient and Sustainable Battery Technologies", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Hassan%20Ihyaoui%20Mly%20Ismail.docx", name: "Hassan Ihyaoui", image: "https://placehold.co/150" },
        { title: "A New Vision to the Teaching and Learning Process of Math", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/imane%20zaghdoud%20Mly%20Ismail.docx", name: "Imane Zaghdoud", image: "https://placehold.co/150" },
        { title: "The Moroccan Education System Between Theory and Practice", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Malak%20Ben%20Sghir%20Mly%20ismail.docx", name: "Malak Ben Sghir", image: "https://placehold.co/150" },
        { title: "Gender Equality and Equity in Children's Education", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Meryeme%20Essaissi%20Mly%20ismail.docx", name: "Meryeme Essaissi", image: "https://placehold.co/150" },
        { title: "A New Vision to Save Life Below Water", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Nour%20ElHouda%20Boukhita%20Mly%20Ismail.docx", name: "Nour ElHouda Boukhita", image: "https://placehold.co/150" },
        { title: "Children's Education in Case Divorce in Morocco", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Oumaima%20Lakhlif%20Mly%20ismail.docx", name: "Oumaima Lakhlif", image: "https://placehold.co/150" },
        { title: "A New Vision for Saving Water Sources in the Region of Fes Meknes", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Rahmani%20Mohamed%20Karim%20Mly%20ismail.docx", name: "Rahmani Mohamed Karim", image: "https://placehold.co/150" },
        { title: "Taking Individual Actions for Zero Hunger", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Walid%20Mzoughi%20Mly%20Ismail.docx", name: "Walid Mzoughi", image: "https://placehold.co/150" }
    ],
    practice: [
        { title: "Coming Soon.", link: "#", name: "Soon...", image: "https://placehold.co/150" }
    ]
};

async function migrateProjects() {
    let client;
    
    try {
        console.log('Connecting to MongoDB...');
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db(process.env.MONGODB_DB_NAME || 'school_platform');
        const content = db.collection('content');
        
        console.log('Connected to database.');
        
        // Check if projects already exist
        const existingProjects = await content.find({ section: 'projects' }).toArray();
        if (existingProjects.length > 0) {
            console.log(`Found ${existingProjects.length} existing projects. Skipping migration.`);
            console.log('If you want to re-migrate, please delete existing projects first.');
            return;
        }
        
        console.log('Migrating projects...');
        
        const projectsToInsert = [];
        let order = 0;
        
        // Migrate theory projects (English)
        for (const project of staticProjects.theory) {
            projectsToInsert.push({
                title: project.title,
                body: '', // No description in original data
                imageUrl: project.image,
                section: 'projects',
                order: order++,
                language: 'en',
                isActive: true,
                metadata: {
                    type: 'theory',
                    studentName: project.name,
                    projectLink: project.link
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        // Migrate practice projects (English)
        for (const project of staticProjects.practice) {
            projectsToInsert.push({
                title: project.title,
                body: '', // No description in original data
                imageUrl: project.image,
                section: 'projects',
                order: order++,
                language: 'en',
                isActive: true,
                metadata: {
                    type: 'practice',
                    studentName: project.name,
                    projectLink: project.link
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        // Add some sample Arabic projects (you can customize these)
        const arabicProjects = [
            {
                title: "رؤية جديدة لتصميم جدول الطلاب في المدرسة",
                body: "مشروع يهدف إلى تطوير نظام جديد لإدارة الوقت المدرسي",
                imageUrl: "https://placehold.co/150",
                section: 'projects',
                order: order++,
                language: 'ar',
                isActive: true,
                metadata: {
                    type: 'theory',
                    studentName: "آية حمي",
                    projectLink: "#"
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "رؤية جديدة لمحاربة التنمر في المدرسة",
                body: "مشروع يقترح حلول مبتكرة لمواجهة ظاهرة التنمر المدرسي",
                imageUrl: "https://placehold.co/150",
                section: 'projects',
                order: order++,
                language: 'ar',
                isActive: true,
                metadata: {
                    type: 'theory',
                    studentName: "بوفارس سارة",
                    projectLink: "#"
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        projectsToInsert.push(...arabicProjects);
        
        // Insert all projects
        if (projectsToInsert.length > 0) {
            const result = await content.insertMany(projectsToInsert);
            console.log(`Successfully migrated ${result.insertedCount} projects.`);
            
            // Display summary
            const theoryCount = projectsToInsert.filter(p => p.metadata.type === 'theory').length;
            const practiceCount = projectsToInsert.filter(p => p.metadata.type === 'practice').length;
            const englishCount = projectsToInsert.filter(p => p.language === 'en').length;
            const arabicCount = projectsToInsert.filter(p => p.language === 'ar').length;
            
            console.log('\nMigration Summary:');
            console.log(`- Theory projects: ${theoryCount}`);
            console.log(`- Practice projects: ${practiceCount}`);
            console.log(`- English projects: ${englishCount}`);
            console.log(`- Arabic projects: ${arabicCount}`);
            console.log(`- Total projects: ${result.insertedCount}`);
        } else {
            console.log('No projects to migrate.');
        }
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\nDatabase connection closed.');
        }
    }
}

// Helper function to clear existing projects (use with caution!)
async function clearExistingProjects() {
    let client;
    
    try {
        console.log('Connecting to MongoDB...');
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db(process.env.MONGODB_DB_NAME || 'school_platform');
        const content = db.collection('content');
        
        const result = await content.deleteMany({ section: 'projects' });
        console.log(`Deleted ${result.deletedCount} existing projects.`);
        
    } catch (error) {
        console.error('Clear operation failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Command line interface
const command = process.argv[2];

if (command === 'clear') {
    console.log('⚠️  WARNING: This will delete all existing projects!');
    console.log('Type "yes" to continue or anything else to cancel:');
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', async () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
            const input = chunk.trim().toLowerCase();
            if (input === 'yes') {
                await clearExistingProjects();
                console.log('Projects cleared. You can now run the migration again.');
            } else {
                console.log('Operation cancelled.');
            }
            process.exit(0);
        }
    });
} else {
    // Run migration
    console.log('Starting projects migration...');
    console.log('This will migrate static projects data to the database.');
    console.log('If projects already exist, migration will be skipped.\n');
    
    migrateProjects()
        .then(() => {
            console.log('\n✅ Migration completed successfully!');
            console.log('You can now manage projects through the admin interface.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateProjects, clearExistingProjects };