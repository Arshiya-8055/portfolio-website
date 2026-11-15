/**
 * Skills Controller
 * Returns skills grouped by category with proficiency percentages and icons.
 */
const { mongoose } = require('../config/db');
const SkillModel = require('../models/Skill');
let { inMemorySkills } = require('../models/dataStore');

const isMongoLive = () => {
  return mongoose && mongoose.connection.readyState === 1 && SkillModel !== null;
};

// GET /api/skills
const getSkills = async (req, res, next) => {
  try {
    const { category } = req.query;
    let skillsList = [];

    if (isMongoLive()) {
      const filter = category ? { category: new RegExp(`^${category}$`, 'i') } : {};
      skillsList = await SkillModel.find(filter).sort({ sortOrder: 1, name: 1 });
    } else {
      skillsList = [...inMemorySkills];
      if (category) {
        skillsList = skillsList.filter(s => s.category.toLowerCase() === category.toLowerCase());
      }
      skillsList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // Group by category for intuitive frontend consumption
    const grouped = {
      Technical: [],
      Professional: [],
      Creative: []
    };

    skillsList.forEach(skill => {
      const cat = skill.category || 'Technical';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(skill);
    });

    return res.json({
      status: 'success',
      source: isMongoLive() ? 'mongodb' : 'memory_store',
      count: skillsList.length,
      data: grouped,
      all: skillsList
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills };
