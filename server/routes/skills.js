/**
 * Skills Router
 */
let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

function createMiniRouter() {
  const routes = [];
  const add = (method, path, ...handlers) => routes.push({ method, path, handlers });
  return {
    routes,
    get: (path, ...handlers) => add('GET', path, ...handlers),
    post: (path, ...handlers) => add('POST', path, ...handlers)
  };
}

const router = express ? express.Router() : createMiniRouter();
const { getSkills } = require('../controllers/skillsController');

router.get('/', getSkills);

module.exports = router;
