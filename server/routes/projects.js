/**
 * Projects Router
 * Handles CRUD and querying for projects.
 */
let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

const router = express ? express.Router() : createMiniRouter();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController');
const { requireAdmin } = require('../middleware/auth');
const { validateProject } = require('../middleware/validate');

function createMiniRouter() {
  const routes = [];
  const add = (method, path, ...handlers) => routes.push({ method, path, handlers });
  return {
    routes,
    get: (path, ...handlers) => add('GET', path, ...handlers),
    post: (path, ...handlers) => add('POST', path, ...handlers),
    put: (path, ...handlers) => add('PUT', path, ...handlers),
    delete: (path, ...handlers) => add('DELETE', path, ...handlers)
  };
}

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireAdmin, validateProject, createProject);
router.put('/:id', requireAdmin, validateProject, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

module.exports = router;
