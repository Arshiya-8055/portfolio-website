/**
 * Projects Controller
 * Handles CRUD operations, filtering by tech and featured status.
 * Interacts with MongoDB via Mongoose or in-memory store when offline.
 */
const { mongoose } = require('../config/db');
const ProjectModel = require('../models/Project');
let { inMemoryProjects } = require('../models/dataStore');

// Helper to check live database status
const isMongoLive = () => {
  return mongoose && mongoose.connection.readyState === 1 && ProjectModel !== null;
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { tech, featured } = req.query;

    if (isMongoLive()) {
      const filter = {};
      if (tech) {
        filter.techStack = { $regex: new RegExp(`^${tech}$`, 'i') };
      }
      if (featured !== undefined) {
        filter.featured = featured === 'true';
      }

      const projects = await ProjectModel.find(filter).sort({ featured: -1, createdAt: -1 });
      return res.json({
        status: 'success',
        source: 'mongodb',
        count: projects.length,
        data: projects
      });
    }

    // Fallback in-memory
    let filtered = [...inMemoryProjects];
    if (tech) {
      const searchTech = tech.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.techStack && p.techStack.some(t => t.toLowerCase() === searchTech)
      );
    }
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      filtered = filtered.filter(p => !!p.featured === isFeatured);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      status: 'success',
      source: 'memory_store',
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoLive()) {
      try {
        const project = await ProjectModel.findById(id);
        if (!project) {
          return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
        }
        return res.json({ status: 'success', source: 'mongodb', data: project });
      } catch (err) {
        return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
      }
    }

    const project = inMemoryProjects.find(p => String(p._id) === String(id));
    if (!project) {
      return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
    }

    return res.json({ status: 'success', source: 'memory_store', data: project });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects (Admin Only)
const createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, imageUrl, featured } = req.body;

    const newProjectData = {
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : [],
      githubUrl: githubUrl || 'https://github.com/Arshiya-8055',
      liveUrl: liveUrl || '#',
      imageUrl: imageUrl || 'assets/projects/academic.svg',
      featured: featured === true || featured === 'true',
      createdAt: new Date()
    };

    if (isMongoLive()) {
      const created = await ProjectModel.create(newProjectData);
      return res.status(201).json({
        status: 'success',
        source: 'mongodb',
        message: 'Project created successfully in MongoDB',
        data: created
      });
    }

    newProjectData._id = 'proj_' + Date.now();
    inMemoryProjects.unshift(newProjectData);

    return res.status(201).json({
      status: 'success',
      source: 'memory_store',
      message: 'Project created successfully in resilient store',
      data: newProjectData
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id (Admin Only)
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates._id;

    if (updates.featured !== undefined) {
      updates.featured = updates.featured === true || updates.featured === 'true';
    }

    if (isMongoLive()) {
      try {
        const updated = await ProjectModel.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true
        });
        if (!updated) {
          return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
        }
        return res.json({
          status: 'success',
          source: 'mongodb',
          message: 'Project updated successfully in MongoDB',
          data: updated
        });
      } catch (err) {
        return res.status(400).json({ status: 'error', message: err.message });
      }
    }

    const index = inMemoryProjects.findIndex(p => String(p._id) === String(id));
    if (index === -1) {
      return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
    }

    inMemoryProjects[index] = {
      ...inMemoryProjects[index],
      ...updates
    };

    return res.json({
      status: 'success',
      source: 'memory_store',
      message: 'Project updated successfully',
      data: inMemoryProjects[index]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id (Admin Only)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoLive()) {
      try {
        const deleted = await ProjectModel.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
        }
        return res.json({
          status: 'success',
          source: 'mongodb',
          message: 'Project deleted successfully from MongoDB'
        });
      } catch (err) {
        return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
      }
    }

    const index = inMemoryProjects.findIndex(p => String(p._id) === String(id));
    if (index === -1) {
      return res.status(404).json({ status: 'error', message: `Project with ID ${id} not found.` });
    }

    inMemoryProjects.splice(index, 1);

    return res.json({
      status: 'success',
      source: 'memory_store',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
