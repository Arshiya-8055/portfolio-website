/**
 * Database Seeder Script: scripts/seed.js
 * Populates MongoDB Atlas with Shaik Arshiya Begum's projects and categorized skills.
 * Run with: npm run seed
 */
const path = require('path');
const fs = require('fs');

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv optional
}

const { connectDB, mongoose } = require('../server/config/db');
const ProjectModel = require('../server/models/Project');
const SkillModel = require('../server/models/Skill');
const { initialProjects, initialSkills } = require('../server/models/dataStore');

async function seedDatabase() {
  console.log('='.repeat(65));
  console.log('🌱 Seeding Shaik Arshiya Begum Portfolio Database...');
  console.log('='.repeat(65));

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('[Notice] MONGODB_URI is not defined in .env.');
    console.log('[Notice] The in-memory data store is pre-configured with all projects & skills:');
    printSeedSummary(initialProjects, initialSkills);
    console.log('\n💡 To seed a live MongoDB Atlas cluster:');
    console.log('   1. Open .env');
    console.log('   2. Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio');
    console.log('   3. Run: npm run seed');
    console.log('='.repeat(65));
    process.exit(0);
  }

  try {
    const connected = await connectDB();
    if (!connected || !mongoose || mongoose.connection.readyState !== 1) {
      console.log('❌ Could not establish connection to MongoDB Atlas.');
      console.log('   Please check your connection string, password, and Network Access (0.0.0.0/0).');
      process.exit(1);
    }

    console.log('🔄 Cleaning up existing Projects & Skills collections...');
    if (ProjectModel) await ProjectModel.deleteMany({});
    if (SkillModel) await SkillModel.deleteMany({});

    console.log('📥 Inserting Projects...');
    // Strip custom _id to allow MongoDB ObjectId generation
    const projectsToInsert = initialProjects.map(p => {
      const copy = { ...p };
      delete copy._id;
      return copy;
    });
    const createdProjects = await ProjectModel.insertMany(projectsToInsert);

    console.log('📥 Inserting Categorized Skills...');
    const skillsToInsert = initialSkills.map(s => {
      const copy = { ...s };
      delete copy._id;
      return copy;
    });
    const createdSkills = await SkillModel.insertMany(skillsToInsert);

    console.log('\n✅ Successfully seeded MongoDB Atlas!');
    printSeedSummary(createdProjects, createdSkills);
    console.log('='.repeat(65));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
    process.exit(1);
  }
}

function printSeedSummary(projects, skills) {
  console.log(`\n📦 Total Projects (${projects.length}):`);
  projects.forEach((p, idx) => {
    console.log(`   ${idx + 1}. [${p.title}] - Tech: ${p.techStack.join(', ')}`);
  });

  console.log(`\n🎯 Total Skills (${skills.length}):`);
  const cats = {};
  skills.forEach(s => {
    cats[s.category] = cats[s.category] || [];
    cats[s.category].push(`${s.name} (${s.level}%)`);
  });
  Object.keys(cats).forEach(cat => {
    console.log(`   • ${cat}: ${cats[cat].join(', ')}`);
  });
}

seedDatabase();
