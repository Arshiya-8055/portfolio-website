/**
 * Project Model (Mongoose Schema)
 * Fields: title, description, techStack, githubUrl, liveUrl, imageUrl, featured, createdAt
 */
const { mongoose } = require('../config/db');

let ProjectModel = null;

if (mongoose) {
  const projectSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
      },
      description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true
      },
      techStack: {
        type: [String],
        default: [],
        index: true
      },
      githubUrl: {
        type: String,
        default: 'https://github.com/Arshiya-8055',
        trim: true
      },
      liveUrl: {
        type: String,
        default: '#',
        trim: true
      },
      imageUrl: {
        type: String,
        default: 'assets/projects/academic.svg',
        trim: true
      },
      featured: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

  ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);
}

module.exports = ProjectModel;
