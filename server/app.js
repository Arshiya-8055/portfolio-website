/**
 * Main Application Server
 * Shaik Arshiya Begum - Personal Portfolio API & Web App
 * Configured for both local development and Vercel Serverless Function deployment.
 */
const path = require('path');
const fs = require('fs');
const http = require('http');

// Load environment variables
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv not installed yet; use process.env
}

const { connectDB, getDbStatus } = require('./config/db');
const projectsRouter = require('./routes/projects');
const skillsRouter = require('./routes/skills');
const contactRouter = require('./routes/contact');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

let app;

if (express) {
  // Standard Express.js Application Pipeline
  app = express();

  // Helmet Security Headers
  try {
    const helmet = require('helmet');
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", '*']
          }
        },
        crossOriginEmbedderPolicy: false
      })
    );
  } catch (e) {
    // helmet optional in dev
  }

  // CORS Configuration
  try {
    const cors = require('cors');
    const allowedOrigin = process.env.CORS_ORIGIN || '*';
    app.use(
      cors({
        origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Requested-With']
      })
    );
  } catch (e) {
    // cors fallback
  }

  // Body Parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // General Rate Limiter on /api
  app.use('/api', generalLimiter);

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Shaik Arshiya Begum Portfolio API',
      version: '1.0.0',
      database: getDbStatus(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.use('/api/projects', projectsRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/contact', contactRouter);

  // Serve Static Client in Local Mode
  const clientDir = path.join(__dirname, '../client');
  app.use(express.static(clientDir));

  // Client routes fallback
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(clientDir, 'admin.html'));
  });

  // 404 & Centralized Error Handlers
  app.use('/api/*', notFoundHandler);
  app.use(errorHandler);

} else {
  // Built-in Resilient HTTP Server Engine for Zero-Dependency Runtime
  app = createResilientApp();
}

/**
 * Resilient App Engine: Implements the exact same Express API signature & routes
 * using pure Node.js core modules, guaranteeing zero downtime and testability.
 */
function createResilientApp() {
  const clientDir = path.join(__dirname, '../client');
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
  };

  const server = function (req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Helper utilities attached to res
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };
    res.json = function (data) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.end(JSON.stringify(data));
    };

    // Attach query params
    req.query = {};
    parsedUrl.searchParams.forEach((val, key) => {
      req.query[key] = val;
    });

    // CORS pre-flight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      });
      return res.end();
    }

    // Body parser
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      if (bodyData.length > 1e6) req.destroy();
    });

    req.on('end', () => {
      if (bodyData) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      dispatchRequest(req, res, pathname);
    });
  };

  function dispatchRequest(req, res, pathname) {
    // 1. Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return res.status(200).json({
        status: 'healthy',
        app: 'Shaik Arshiya Begum Portfolio API',
        version: '1.0.0',
        database: getDbStatus(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Projects Router
    if (pathname.startsWith('/api/projects')) {
      return handleRouter(projectsRouter, req, res, pathname.replace(/^\/api\/projects/, '') || '/');
    }

    // 3. Skills Router
    if (pathname.startsWith('/api/skills')) {
      return handleRouter(skillsRouter, req, res, pathname.replace(/^\/api\/skills/, '') || '/');
    }

    // 4. Contact Router
    if (pathname.startsWith('/api/contact')) {
      return handleRouter(contactRouter, req, res, pathname.replace(/^\/api\/contact/, '') || '/');
    }

    // 5. Static Files & Client Pages
    let filePath = pathname === '/' ? path.join(clientDir, 'index.html') :
                   pathname === '/admin' ? path.join(clientDir, 'admin.html') :
                   path.join(clientDir, pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return fs.createReadStream(filePath).pipe(res);
    }

    // 404
    if (pathname.startsWith('/api/')) {
      return res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${pathname}` });
    }

    // Fallback to index.html for SPA-like routes
    const indexPath = path.join(clientDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return fs.createReadStream(indexPath).pipe(res);
    }

    res.status(404).end('Not Found');
  }

  function handleRouter(router, req, res, subPath) {
    const routes = router.routes || [];
    for (const r of routes) {
      if (r.method === req.method) {
        let match = false;
        let params = {};

        if (r.path === '/' && (subPath === '/' || subPath === '')) {
          match = true;
        } else if (r.path.includes('/:')) {
          const rParts = r.path.split('/').filter(Boolean);
          const sParts = subPath.split('/').filter(Boolean);
          if (rParts.length === sParts.length) {
            match = true;
            for (let i = 0; i < rParts.length; i++) {
              if (rParts[i].startsWith(':')) {
                params[rParts[i].slice(1)] = sParts[i];
              } else if (rParts[i] !== sParts[i]) {
                match = false;
                break;
              }
            }
          }
        }

        if (match) {
          req.params = params;
          let idx = 0;
          const next = (err) => {
            if (err) return errorHandler(err, req, res, () => {});
            idx++;
            if (idx < r.handlers.length) {
              try {
                r.handlers[idx](req, res, next);
              } catch (e) {
                errorHandler(e, req, res, () => {});
              }
            }
          };
          try {
            return r.handlers[0](req, res, next);
          } catch (e) {
            return errorHandler(e, req, res, () => {});
          }
        }
      }
    }
    return res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.url}` });
  }

  server.listen = function (port, callback) {
    const s = http.createServer(server);
    return s.listen(port, callback);
  };

  return server;
}

// Local Execution Listener
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log('='.repeat(65));
      console.log('🚀 Shaik Arshiya Begum - Personal Portfolio Production Server');
      console.log('='.repeat(65));
      console.log(`📡 Local Server URL:  http://localhost:${PORT}`);
      console.log(`🌐 Public Admin URL:  http://localhost:${PORT}/admin`);
      console.log(`📊 Health Endpoint:   http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database Status:   ${JSON.stringify(getDbStatus().provider)}`);
      console.log('='.repeat(65));
    });
  });
}

// Export app for Vercel serverless functions
module.exports = app;
