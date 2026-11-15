/**
 * Contact Router
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
const { submitContact, getContacts } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');
const { validateContact } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

router.post('/', contactLimiter, validateContact, submitContact);
router.get('/', requireAdmin, getContacts);

module.exports = router;
