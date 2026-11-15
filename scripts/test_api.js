/**
 * Automated Full-Stack API & Integration Test Suite
 * Shaik Arshiya Begum Portfolio Website
 * Pure In-Process Test Runner (runs 100% reliably in sandboxed & CI environments)
 */

const path = require('path');
const { EventEmitter } = require('events');
const { Readable } = require('stream');

// Load environment
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

const app = require('../server/app');
const ADMIN_KEY = process.env.ADMIN_KEY || 'arshiya-portfolio-admin-secret-2026';

function executeRequest(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === 'string' ? body : JSON.stringify(body));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = url;
    req.headers = Object.assign({ host: 'localhost' }, headers);
    if (body && !req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }

    const res = new EventEmitter();
    let resBody = '';
    const resHeaders = {};
    res.statusCode = 200;

    res.setHeader = (k, v) => {
      resHeaders[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => resHeaders[k.toLowerCase()];
    res.writeHead = (code, headersObj) => {
      res.statusCode = code;
      if (headersObj) {
        Object.entries(headersObj).forEach(([k, v]) => {
          resHeaders[k.toLowerCase()] = v;
        });
      }
    };
    res.write = (chunk) => {
      if (chunk) resBody += chunk;
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk;
      let parsed = resBody;
      try {
        parsed = JSON.parse(resBody);
      } catch (e) {}
      resolve({
        status: res.statusCode,
        headers: resHeaders,
        body: parsed
      });
    };

    try {
      app(req, res);
    } catch (err) {
      reject(err);
    }
  });
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('🧪 Starting Shaik Arshiya Begum Portfolio Test Suite');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health returns healthy system status', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/api/health' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.status !== 'healthy') throw new Error(`Status is not healthy: ${res.body.status}`);
  });

  // 2. GET /api/projects
  let sampleProjectId = null;
  await test('GET /api/projects returns seeded projects array', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/api/projects' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.data) || res.body.data.length < 2) {
      throw new Error(`Expected at least 2 projects, got ${res.body.data?.length}`);
    }
    sampleProjectId = res.body.data[0]._id;
  });

  // 3. GET /api/projects?tech=Python
  await test('GET /api/projects?tech=Python filters by technology tag', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/api/projects?tech=Python' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const list = res.body.data;
    if (!list || list.length === 0) throw new Error('Expected at least 1 Python project');
    for (const p of list) {
      const hasPython = p.techStack.some(t => t.toLowerCase() === 'python');
      if (!hasPython) throw new Error(`Project ${p.title} missing Python in techStack`);
    }
  });

  // 4. GET /api/projects/:id
  await test(`GET /api/projects/:id retrieves project by ID`, async () => {
    if (!sampleProjectId) throw new Error('No sample project ID available');
    const res = await executeRequest(app, { method: 'GET', url: `/api/projects/${sampleProjectId}` });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (String(res.body.data._id) !== String(sampleProjectId)) {
      throw new Error(`Returned ID mismatch: ${res.body.data._id}`);
    }
  });

  // 5. POST /api/projects auth rejection (no key)
  await test('POST /api/projects rejects request without x-admin-key (401)', async () => {
    const res = await executeRequest(app, {
      method: 'POST',
      url: '/api/projects',
      body: { title: 'Unauthorized Test', description: 'Testing auth' }
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 6. POST /api/projects auth rejection (invalid key)
  await test('POST /api/projects rejects request with invalid x-admin-key (403)', async () => {
    const res = await executeRequest(app, {
      method: 'POST',
      url: '/api/projects',
      headers: { 'x-admin-key': 'wrong-key-xyz' },
      body: { title: 'Invalid Key Test', description: 'Testing auth' }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 7. POST /api/projects create project with valid key
  let newCreatedId = null;
  await test('POST /api/projects creates project with valid x-admin-key (201)', async () => {
    const payload = {
      title: 'Automated Test Project',
      description: 'Created by automated integration test runner to verify API functionality.',
      techStack: ['Node.js', 'Express', 'Jest'],
      githubUrl: 'https://github.com/Arshiya-8055/test',
      liveUrl: '#',
      featured: false
    };
    const res = await executeRequest(app, {
      method: 'POST',
      url: '/api/projects',
      headers: { 'x-admin-key': ADMIN_KEY },
      body: payload
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    newCreatedId = res.body.data._id;
    if (!newCreatedId) throw new Error('Created project missing _id');
  });

  // 8. PUT /api/projects/:id update project
  await test('PUT /api/projects/:id updates project (200)', async () => {
    if (!newCreatedId) throw new Error('No created project ID to update');
    const updatePayload = {
      title: 'Updated Test Project Title',
      featured: true
    };
    const res = await executeRequest(app, {
      method: 'PUT',
      url: `/api/projects/${newCreatedId}`,
      headers: { 'x-admin-key': ADMIN_KEY },
      body: updatePayload
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.data.title !== 'Updated Test Project Title') {
      throw new Error('Title was not updated correctly');
    }
  });

  // 9. DELETE /api/projects/:id delete project
  await test('DELETE /api/projects/:id deletes project (200)', async () => {
    if (!newCreatedId) throw new Error('No created project ID to delete');
    const res = await executeRequest(app, {
      method: 'DELETE',
      url: `/api/projects/${newCreatedId}`,
      headers: { 'x-admin-key': ADMIN_KEY }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 10. GET /api/skills
  await test('GET /api/skills returns grouped categories (Technical, Professional, Creative)', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/api/skills' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = res.body.data;
    if (!data.Technical || !data.Professional || !data.Creative) {
      throw new Error('Skills missing expected grouped categories');
    }
    if (data.Technical.length === 0) throw new Error('Technical skills array is empty');
  });

  // 11. POST /api/contact validation error
  await test('POST /api/contact rejects invalid contact payload (400)', async () => {
    const invalidPayload = { name: 'A', email: 'invalid-email', subject: '', message: '' };
    const res = await executeRequest(app, {
      method: 'POST',
      url: '/api/contact',
      body: invalidPayload
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!Array.isArray(res.body.errors) || res.body.errors.length === 0) {
      throw new Error('Expected validation error messages array');
    }
  });

  // 12. POST /api/contact success
  await test('POST /api/contact saves valid contact message (201)', async () => {
    const validPayload = {
      name: 'Arshiya Recruiter',
      email: 'recruiter@techcorp.example.com',
      subject: 'Exciting AI/ML Opportunity',
      message: 'Hello Shaik Arshiya Begum, we are impressed with your portfolio projects and would love to interview you!'
    };
    const res = await executeRequest(app, {
      method: 'POST',
      url: '/api/contact',
      body: validPayload
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.body.status !== 'success') throw new Error('Status not success');
  });

  // 13. Static files: GET /
  await test('Static files: GET / serves index.html (200)', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!String(res.body).includes('Shaik Arshiya Begum')) {
      throw new Error('index.html missing Shaik Arshiya Begum in response content');
    }
  });

  // 14. Static files: GET /admin
  await test('Static files: GET /admin serves admin.html (200)', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/admin' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!String(res.body).includes('Portfolio Management Dashboard') && !String(res.body).includes('Admin Unlock')) {
      throw new Error('admin.html missing expected title');
    }
  });

  // 15. Static files: GET /css/style.css
  await test('Static files: GET /css/style.css serves valid CSS (200)', async () => {
    const res = await executeRequest(app, { method: 'GET', url: '/css/style.css' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!String(res.body).includes('--font-heading')) {
      throw new Error('style.css content check failed');
    }
  });

  console.log('='.repeat(70));
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All 15 Endpoints & Integration Checks Verified Successfully!');
    process.exit(0);
  }
}

runTests();
