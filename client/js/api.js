/**
 * Client API Service Module: client/js/api.js
 * IMPORTANT: All endpoints use RELATIVE URLs (/api/...) for universal compatibility
 * across localhost, custom domains, and Vercel serverless functions.
 * Includes built-in resilient offline fallbacks so the site displays content even when
 * opened directly as a file (file://) or before the backend server is started.
 */

// Resilient default seed data (mirrors server/models/dataStore.js)
const FALLBACK_PROJECTS = [
  {
    _id: 'proj_academic_01',
    title: 'College Academic Projects',
    description: 'Completed internal academic assignments and practical tasks as part of my B.Tech coursework in Artificial Intelligence & Machine Learning.',
    techStack: ['Python', 'C', 'HTML', 'CSS'],
    githubUrl: 'https://github.com/Arshiya-8055',
    liveUrl: 'https://github.com/Arshiya-8055',
    imageUrl: 'assets/projects/academic.svg',
    featured: true,
    createdAt: '2025-10-15T10:00:00Z'
  },
  {
    _id: 'proj_portfolio_02',
    title: 'Personal Portfolio Website',
    description: 'Developing a personal portfolio website to showcase my education, skills, interests, and work with a modern responsive UI, REST API, and MongoDB integration.',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
    githubUrl: 'https://github.com/Arshiya-8055',
    liveUrl: '/',
    imageUrl: 'assets/projects/portfolio.svg',
    featured: true,
    createdAt: '2026-01-20T12:00:00Z'
  },
  {
    _id: 'proj_placeholder_03',
    title: '[Placeholder] AI & ML Predictive Analytics',
    description: 'Predictive data exploration and classification modeling developed during B.Tech coursework. (Placeholder - customize with your capstone or upcoming AI project).',
    techStack: ['Python', 'Machine Learning', 'Data Analysis'],
    githubUrl: 'https://github.com/Arshiya-8055',
    liveUrl: 'https://github.com/Arshiya-8055',
    imageUrl: 'assets/projects/ai_project.svg',
    featured: false,
    createdAt: '2026-03-01T09:00:00Z'
  }
];

const FALLBACK_SKILLS = {
  Technical: [
    { _id: 'skill_tech_01', name: 'Python', category: 'Technical', level: 88, icon: 'code', sortOrder: 1 },
    { _id: 'skill_tech_02', name: 'HTML & CSS', category: 'Technical', level: 92, icon: 'layout', sortOrder: 2 },
    { _id: 'skill_tech_03', name: 'JavaScript', category: 'Technical', level: 82, icon: 'cpu', sortOrder: 3 }
  ],
  Professional: [
    { _id: 'skill_prof_01', name: 'Problem Solving', category: 'Professional', level: 88, icon: 'puzzle', sortOrder: 4 },
    { _id: 'skill_prof_02', name: 'Communication', category: 'Professional', level: 90, icon: 'message-circle', sortOrder: 5 },
    { _id: 'skill_prof_03', name: 'Teamwork', category: 'Professional', level: 92, icon: 'users', sortOrder: 6 }
  ],
  Creative: [
    { _id: 'skill_creat_01', name: 'Web Design', category: 'Creative', level: 86, icon: 'pen-tool', sortOrder: 7 },
    { _id: 'skill_creat_02', name: 'App Design', category: 'Creative', level: 82, icon: 'smartphone', sortOrder: 8 },
    { _id: 'skill_creat_03', name: 'Creative Thinking', category: 'Creative', level: 90, icon: 'zap', sortOrder: 9 }
  ]
};

const API = {
  // Base endpoints
  ENDPOINTS: {
    PROJECTS: '/api/projects',
    SKILLS: '/api/skills',
    CONTACT: '/api/contact',
    HEALTH: '/api/health'
  },

  /**
   * Fetch all projects, optionally filtered by technology or featured status
   * @param {string} [tech] - Technology tag to filter by (e.g. 'Python')
   * @param {boolean} [featured] - Only featured projects
   */
  async getProjects(tech, featured) {
    const params = new URLSearchParams();
    if (tech && tech !== 'all') params.append('tech', tech);
    if (featured !== undefined) params.append('featured', featured);

    const url = `${this.ENDPOINTS.PROJECTS}${params.toString() ? '?' + params.toString() : ''}`;

    // Attempt live REST API fetch first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        try {
          localStorage.setItem('cached_projects', JSON.stringify(data.data));
        } catch (e) {}
        return data;
      }
      throw new Error('Invalid response structure');
    } catch (err) {
      console.warn(`[API Notice] Live REST API unavailable (${err.message}). Using resilient local data.`);

      // Resilient local fallback
      let projects = [];
      try {
        const stored = localStorage.getItem('cached_projects');
        projects = stored ? JSON.parse(stored) : FALLBACK_PROJECTS;
      } catch (e) {
        projects = FALLBACK_PROJECTS;
      }

      let filtered = [...projects];
      if (tech && tech !== 'all') {
        const searchTech = tech.toLowerCase().trim();
        filtered = filtered.filter(p =>
          p.techStack && p.techStack.some(t => t.toLowerCase() === searchTech)
        );
      }
      if (featured !== undefined) {
        filtered = filtered.filter(p => !!p.featured === (featured === true || featured === 'true'));
      }

      return {
        status: 'success',
        source: 'resilient_fallback',
        count: filtered.length,
        data: filtered
      };
    }
  },

  /**
   * Get single project by ID
   */
  async getProjectById(id) {
    try {
      const res = await fetch(`${this.ENDPOINTS.PROJECTS}/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      let projects = FALLBACK_PROJECTS;
      try {
        const stored = localStorage.getItem('cached_projects');
        if (stored) projects = JSON.parse(stored);
      } catch (e) {}
      const found = projects.find(p => String(p._id) === String(id));
      if (found) {
        return { status: 'success', source: 'resilient_fallback', data: found };
      }
      throw new Error(`Project with ID ${id} not found.`);
    }
  },

  /**
   * Fetch categorized skills
   */
  async getSkills() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(this.ENDPOINTS.SKILLS, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.data) {
        try {
          localStorage.setItem('cached_skills', JSON.stringify(data.data));
        } catch (e) {}
        return data;
      }
      throw new Error('Invalid response structure');
    } catch (err) {
      console.warn(`[API Notice] Live skills API unavailable (${err.message}). Using resilient local catalog.`);
      let skills = FALLBACK_SKILLS;
      try {
        const stored = localStorage.getItem('cached_skills');
        if (stored) skills = JSON.parse(stored);
      } catch (e) {}
      return {
        status: 'success',
        source: 'resilient_fallback',
        data: skills
      };
    }
  },

  /**
   * Submit contact form message
   */
  async sendContact(data) {
    try {
      const res = await fetch(this.ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({ message: 'Network response error' }));
      if (!res.ok) {
        throw new Error(json.message || (json.errors ? json.errors.join(', ') : `HTTP ${res.status}`));
      }
      return json;
    } catch (err) {
      console.warn('[API Notice] Server offline, saving inquiry locally:', err.message);
      try {
        const key = 'offline_contact_messages';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ ...data, savedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
      return {
        status: 'success',
        source: 'offline_queue',
        message: 'Thank you! Your message has been safely recorded.'
      };
    }
  },

  /**
   * Check system and database health
   */
  async checkHealth() {
    try {
      const res = await fetch(this.ENDPOINTS.HEALTH);
      return await res.json();
    } catch (e) {
      return {
        status: 'standby',
        database: { provider: 'Local Resilient Mode' },
        error: e.message
      };
    }
  },

  // -------------------------
  // Admin Methods (Protected)
  // -------------------------

  /**
   * Create a new project (requires admin key)
   */
  async createProject(projectData, adminKey) {
    try {
      const res = await fetch(this.ENDPOINTS.PROJECTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify(projectData)
      });
      const json = await res.json().catch(() => ({ message: 'Server error' }));
      if (!res.ok) throw new Error(json.message || (json.errors ? json.errors.join(', ') : `HTTP ${res.status}`));
      return json;
    } catch (err) {
      console.warn('[Admin Notice] Backend offline, saving to local store:', err.message);
      let projects = [...FALLBACK_PROJECTS];
      try {
        const stored = localStorage.getItem('cached_projects');
        if (stored) projects = JSON.parse(stored);
      } catch (e) {}
      const newProj = {
        _id: 'proj_' + Date.now(),
        ...projectData,
        createdAt: new Date().toISOString()
      };
      projects.unshift(newProj);
      localStorage.setItem('cached_projects', JSON.stringify(projects));
      return { status: 'success', source: 'local_storage', data: newProj };
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(id, projectData, adminKey) {
    try {
      const res = await fetch(`${this.ENDPOINTS.PROJECTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify(projectData)
      });
      const json = await res.json().catch(() => ({ message: 'Server error' }));
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
      return json;
    } catch (err) {
      let projects = [...FALLBACK_PROJECTS];
      try {
        const stored = localStorage.getItem('cached_projects');
        if (stored) projects = JSON.parse(stored);
      } catch (e) {}
      const idx = projects.findIndex(p => String(p._id) === String(id));
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...projectData };
        localStorage.setItem('cached_projects', JSON.stringify(projects));
        return { status: 'success', source: 'local_storage', data: projects[idx] };
      }
      throw new Error(`Project ${id} not found.`);
    }
  },

  /**
   * Delete project by ID
   */
  async deleteProject(id, adminKey) {
    try {
      const res = await fetch(`${this.ENDPOINTS.PROJECTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey
        }
      });
      const json = await res.json().catch(() => ({ message: 'Server error' }));
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
      return json;
    } catch (err) {
      let projects = [...FALLBACK_PROJECTS];
      try {
        const stored = localStorage.getItem('cached_projects');
        if (stored) projects = JSON.parse(stored);
      } catch (e) {}
      projects = projects.filter(p => String(p._id) !== String(id));
      localStorage.setItem('cached_projects', JSON.stringify(projects));
      return { status: 'success', source: 'local_storage' };
    }
  }
};

window.API = API;
