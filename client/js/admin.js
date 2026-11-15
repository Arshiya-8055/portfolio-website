/**
 * Admin Panel Script: client/js/admin.js
 * Enables authenticated project management (Create, Read, Update, Delete)
 * protected by ADMIN_KEY header authentication.
 */

let currentAdminKey = sessionStorage.getItem('admin_key') || '';
let editingProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initAdminModal();
  checkServerHealth();
});

/* ==========================================================================
   1. Authentication Gate
   ========================================================================== */
function initAuth() {
  const gate = document.getElementById('auth-gate');
  const authForm = document.getElementById('auth-form');
  const keyInput = document.getElementById('admin-key-input');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');

  if (currentAdminKey) {
    gate.style.display = 'none';
    loadAdminProjects();
  } else {
    gate.style.display = 'flex';
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredKey = keyInput.value.trim();
      if (!enteredKey) return;

      // Verify key by testing against admin endpoint
      try {
        const testRes = await fetch('/api/contact', {
          headers: { 'x-admin-key': enteredKey }
        });
        if (testRes.status === 401 || testRes.status === 403) {
          authError.textContent = 'Invalid Admin Key. Please verify.';
          authError.style.display = 'block';
          return;
        }

        currentAdminKey = enteredKey;
        sessionStorage.setItem('admin_key', currentAdminKey);
        gate.style.display = 'none';
        authError.style.display = 'none';
        loadAdminProjects();
      } catch (err) {
        // Fallback save and attempt
        currentAdminKey = enteredKey;
        sessionStorage.setItem('admin_key', currentAdminKey);
        gate.style.display = 'none';
        loadAdminProjects();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_key');
      currentAdminKey = '';
      gate.style.display = 'flex';
      if (keyInput) keyInput.value = '';
    });
  }
}

/* ==========================================================================
   2. Health & Status
   ========================================================================== */
async function checkServerHealth() {
  const badge = document.getElementById('system-status-badge');
  const dbInfo = document.getElementById('stat-db-info');
  if (!badge) return;

  try {
    const health = await window.API.checkHealth();
    if (health.status === 'healthy') {
      badge.className = 'status-badge live';
      badge.innerHTML = `● System Online (${health.database?.provider || 'Active'})`;
      if (dbInfo) dbInfo.textContent = health.database?.provider || 'Online';
    } else {
      badge.className = 'status-badge offline';
      badge.innerHTML = `● System Connecting...`;
      if (dbInfo) dbInfo.textContent = 'Standby';
    }
  } catch (e) {
    badge.className = 'status-badge offline';
    badge.innerHTML = `● Offline`;
  }
}

/* ==========================================================================
   3. Load Projects Table
   ========================================================================== */
async function loadAdminProjects() {
  const tbody = document.getElementById('admin-projects-tbody');
  const countEl = document.getElementById('stat-total-projects');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading projects...</td></tr>`;

  try {
    const res = await window.API.getProjects('all');
    const projects = res.data || [];

    if (countEl) countEl.textContent = projects.length;

    if (projects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-sub);">No projects in database. Click "Add Project" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = projects.map(p => `
      <tr>
        <td>
          <img src="${escapeHtml(p.imageUrl || 'assets/projects/academic.svg')}" class="thumb-preview" alt="Thumb">
        </td>
        <td>
          <strong>${escapeHtml(p.title)}</strong>
          <div style="font-size: 0.8rem; color: var(--text-sub); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(p.description)}
          </div>
        </td>
        <td>
          ${(p.techStack || []).map(t => `<span class="badge-tag">${escapeHtml(t)}</span>`).join('')}
        </td>
        <td>
          ${p.featured ? '<span class="badge-featured">Featured</span>' : '<span style="color: var(--text-sub); font-size: 0.8rem;">Standard</span>'}
        </td>
        <td class="actions-cell">
          <button class="btn-admin btn-admin-secondary" onclick="openEditModal('${p._id}')">Edit</button>
          <button class="btn-admin btn-admin-danger" onclick="deleteProject('${p._id}', '${escapeHtml(p.title)}')">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: #f87171; text-align: center; padding: 30px;">Failed to load: ${escapeHtml(error.message)}</td></tr>`;
  }
}

/* ==========================================================================
   4. Modal & CRUD Form Operations
   ========================================================================== */
function initAdminModal() {
  const modal = document.getElementById('project-modal');
  const openBtn = document.getElementById('open-add-modal-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('project-form');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      editingProjectId = null;
      document.getElementById('modal-title').textContent = 'Add New Project';
      form.reset();
      document.getElementById('proj-image').value = 'assets/projects/academic.svg';
      document.getElementById('proj-github').value = 'https://github.com/Arshiya-8055';
      modal.classList.add('active');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('proj-title').value.trim();
      const description = document.getElementById('proj-desc').value.trim();
      const techStackInput = document.getElementById('proj-tech').value.trim();
      const githubUrl = document.getElementById('proj-github').value.trim();
      const liveUrl = document.getElementById('proj-live').value.trim();
      const imageUrl = document.getElementById('proj-image').value.trim();
      const featured = document.getElementById('proj-featured').checked;

      const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title,
        description,
        techStack,
        githubUrl: githubUrl || 'https://github.com/Arshiya-8055',
        liveUrl: liveUrl || '#',
        imageUrl: imageUrl || 'assets/projects/academic.svg',
        featured
      };

      try {
        if (editingProjectId) {
          await window.API.updateProject(editingProjectId, payload, currentAdminKey);
          alert('Project updated successfully!');
        } else {
          await window.API.createProject(payload, currentAdminKey);
          alert('Project created successfully!');
        }
        modal.classList.remove('active');
        loadAdminProjects();
      } catch (err) {
        alert('Action Failed: ' + err.message);
      }
    });
  }
}

window.openEditModal = async function(id) {
  const modal = document.getElementById('project-modal');
  const form = document.getElementById('project-form');

  try {
    const res = await window.API.getProjectById(id);
    const p = res.data;

    editingProjectId = id;
    document.getElementById('modal-title').textContent = 'Edit Project';

    document.getElementById('proj-title').value = p.title || '';
    document.getElementById('proj-desc').value = p.description || '';
    document.getElementById('proj-tech').value = (p.techStack || []).join(', ');
    document.getElementById('proj-github').value = p.githubUrl || '';
    document.getElementById('proj-live').value = p.liveUrl || '';
    document.getElementById('proj-image').value = p.imageUrl || '';
    document.getElementById('proj-featured').checked = !!p.featured;

    modal.classList.add('active');
  } catch (err) {
    alert('Failed to fetch project details: ' + err.message);
  }
};

window.deleteProject = async function(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  try {
    await window.API.deleteProject(id, currentAdminKey);
    alert('Project deleted successfully!');
    loadAdminProjects();
  } catch (err) {
    alert('Delete Failed: ' + err.message);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
