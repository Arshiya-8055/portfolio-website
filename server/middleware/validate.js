/**
 * Input Validation Middleware
 */

const validateContact = (req, res, next) => {
  const { name, email, subject, message } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
    errors.push('Subject must be at least 2 characters long.');
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    errors.push('Message must contain at least 5 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.subject = subject.trim();
  req.body.message = message.trim();
  next();
};

const validateProject = (req, res, next) => {
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';
  const { title, description, techStack } = req.body || {};
  const errors = [];

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      errors.push('Project title must be at least 2 characters long.');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      errors.push('Project description must be at least 5 characters long.');
    }
  }

  if (techStack !== undefined) {
    if (typeof techStack === 'string') {
      req.body.techStack = techStack.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(techStack)) {
      errors.push('techStack must be an array of strings or comma-separated string.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  if (req.body.title) req.body.title = req.body.title.trim();
  if (req.body.description) req.body.description = req.body.description.trim();
  if (req.body.githubUrl) req.body.githubUrl = req.body.githubUrl.trim();
  if (req.body.liveUrl) req.body.liveUrl = req.body.liveUrl.trim();
  next();
};

module.exports = { validateContact, validateProject };
