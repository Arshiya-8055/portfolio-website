/**
 * Main Application Script: client/js/main.js
 * Controls Interactive UI, Typing Animation, Dual Themes, ScrollSpy,
 * Dynamic API Data Loading, Tech Filtering, and Contact Form Handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkFileProtocolNotice();
  initTheme();
  initTypingEffect();
  initNavigation();
  initProjects();
  initSkills();
  initContactForm();
  initScrollTop();
});

function checkFileProtocolNotice() {
  if (window.location.protocol === 'file:') {
    const banner = document.createElement('div');
    banner.className = 'file-notice-banner';
    banner.innerHTML = `
      <div style="background: linear-gradient(90deg, #6366f1, #06b6d4); color: #ffffff; padding: 10px 16px; font-size: 0.88rem; font-weight: 500; text-align: center; display: flex; justify-content: center; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        <span>💡 <strong>Local File Preview:</strong> Skills &amp; projects loaded! To enable live MongoDB Atlas sync &amp; Admin Panel, double-click <code>start_server.bat</code> or run <code>python scripts/dev_server.py</code>.</span>
        <button onclick="this.parentElement.remove()" style="background: rgba(255,255,255,0.25); border: none; color: #fff; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">✕</button>
      </div>
    `;
    document.body.prepend(banner);
  }
}

/* ==========================================================================
   1. Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('theme') || 'dark';

  setTheme(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.innerHTML = theme === 'dark'
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
}

/* ==========================================================================
   2. Typing Effect for Hero Subtitle
   ========================================================================== */
function initTypingEffect() {
  const typedTarget = document.getElementById('hero-typed-text');
  if (!typedTarget) return;

  const roles = [
    'B.Tech 3rd Year CSE (AI & ML)',
    'Aspiring Full Stack Developer',
    'Creative Web & App Designer',
    'Problem Solver & Tech Innovator'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typedTarget.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      typedTarget.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 85;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1800; // Pause at full text
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pause before new word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   3. Navigation, ScrollSpy, and Mobile Menu
   ========================================================================== */
function initNavigation() {
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // ScrollSpy for Active Navbar Link
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. Projects: Fetch from REST API with Tech Filtering
   ========================================================================== */
let allProjectsCache = [];
let currentFilter = 'all';

async function initProjects() {
  const grid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Filter Buttons Event
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-tech') || 'all';
      loadProjects(currentFilter);
    });
  });

  await loadProjects('all');
}

async function loadProjects(tech = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Render Skeleton Loader
  grid.innerHTML = `
    <div class="skeleton-card"><div class="skeleton-shimmer"></div></div>
    <div class="skeleton-card"><div class="skeleton-shimmer"></div></div>
    <div class="skeleton-card"><div class="skeleton-shimmer"></div></div>
  `;

  try {
    const res = await window.API.getProjects(tech);
    const projects = res.data || [];
    allProjectsCache = projects;

    if (projects.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 12px;">No projects found for "${escapeHtml(tech)}".</p>
          <button class="btn btn-outline" onclick="resetProjectFilter()">Show All Projects</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects.map(p => createProjectCardHTML(p)).join('');

  } catch (error) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
        <p style="color: #f87171; font-weight: 600; margin-bottom: 10px;">Failed to load projects from API: ${escapeHtml(error.message)}</p>
        <button class="btn btn-primary" onclick="loadProjects('${tech}')">Retry Loading</button>
      </div>
    `;
  }
}

function resetProjectFilter() {
  const allBtn = document.querySelector('.filter-btn[data-tech="all"]');
  if (allBtn) allBtn.click();
}

function createProjectCardHTML(project) {
  const tagsHtml = (project.techStack || [])
    .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
    .join('');

  const featuredBadge = project.featured
    ? `<span class="featured-badge">Featured</span>`
    : '';

  const liveBtn = project.liveUrl && project.liveUrl !== '#'
    ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
         <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
         Live Demo
       </a>`
    : '';

  const githubBtn = project.githubUrl
    ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
         <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
         Code
       </a>`
    : '';

  return `
    <article class="project-card">
      <div class="project-image-box">
        <img src="${escapeHtml(project.imageUrl || 'assets/projects/academic.svg')}" alt="${escapeHtml(project.title)}" loading="lazy">
        ${featuredBadge}
      </div>
      <div class="project-body">
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-desc">${escapeHtml(project.description)}</p>
        <div class="project-tags">
          ${tagsHtml}
        </div>
        <div class="project-links">
          ${githubBtn}
          ${liveBtn}
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   5. Skills: Fetch from REST API with Level Bar Animations
   ========================================================================== */
async function initSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  try {
    const res = await window.API.getSkills();
    const grouped = res.data || {};

    const categoryIcons = {
      Technical: `💻`,
      Professional: `🤝`,
      Creative: `🎨`
    };

    let html = '';
    for (const [category, skills] of Object.entries(grouped)) {
      if (!skills || skills.length === 0) continue;

      const skillsListHtml = skills.map(skill => `
        <div class="skill-item">
          <div class="skill-info">
            <span>${escapeHtml(skill.name)}</span>
            <span class="skill-level-num">${skill.level}%</span>
          </div>
          <div class="skill-progress-bar">
            <div class="skill-fill" data-level="${skill.level}"></div>
          </div>
        </div>
      `).join('');

      html += `
        <div class="skill-category-card">
          <div class="category-header">
            <div class="category-icon">${categoryIcons[category] || '⚡'}</div>
            <h3>${escapeHtml(category)} Skills</h3>
          </div>
          <div class="skills-list">
            ${skillsListHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    observeSkillBars();

  } catch (error) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">
        <p>Could not load skills list: ${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function observeSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.getAttribute('data-level') || '80';
          bar.style.width = `${level}%`;
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.2 });

    bars.forEach(bar => observer.observe(bar));
  } else {
    // Fallback for older browsers
    bars.forEach(bar => {
      bar.style.width = `${bar.getAttribute('data-level') || 80}%`;
    });
  }
}

/* ==========================================================================
   6. Contact Form Handling
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Client validation
    if (!name || !email || !subject || !message) {
      showFormAlert('Please complete all fields before sending.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormAlert('Please provide a valid email address.', 'error');
      return;
    }

    // Submit state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;
    hideFormAlert();

    try {
      const res = await window.API.sendContact({ name, email, subject, message });
      showFormAlert(res.message || 'Thank you! Your message has been sent successfully.', 'success');
      form.reset();
    } catch (error) {
      showFormAlert(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showFormAlert(msg, type) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `form-alert ${type}`;
    alertBox.style.display = 'block';
  }

  function hideFormAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }
}

/* ==========================================================================
   7. Scroll to Top
   ========================================================================== */
function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Utility: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
