/**
 * Skill Model (Mongoose Schema)
 * Fields: name, category, level, icon, sortOrder
 */
const { mongoose } = require('../config/db');

let SkillModel = null;

if (mongoose) {
  const skillSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true
      },
      category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Technical', 'Professional', 'Creative'],
        index: true
      },
      level: {
        type: Number,
        required: [true, 'Proficiency level is required (1-100)'],
        min: 1,
        max: 100,
        default: 80
      },
      icon: {
        type: String,
        default: 'code'
      },
      sortOrder: {
        type: Number,
        default: 0
      }
    },
    {
      timestamps: true
    }
  );

  SkillModel = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
}

module.exports = SkillModel;
