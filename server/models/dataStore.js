/**
 * Initial Seed Data & Fallback Store for Shaik Arshiya Begum's Portfolio
 */

const initialProjects = [
  {
    _id: 'proj_academic_01',
    title: 'College Academic Projects',
    description: 'Completed internal academic assignments and practical tasks as part of my B.Tech coursework in Artificial Intelligence & Machine Learning.',
    techStack: ['Python', 'C', 'HTML', 'CSS'],
    githubUrl: 'https://github.com/Arshiya-8055',
    liveUrl: 'https://github.com/Arshiya-8055',
    imageUrl: 'assets/projects/academic.svg',
    featured: true,
    createdAt: new Date('2025-10-15T10:00:00Z')
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
    createdAt: new Date('2026-01-20T12:00:00Z')
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
    createdAt: new Date('2026-03-01T09:00:00Z')
  }
];

const initialSkills = [
  // Technical Skills
  { _id: 'skill_tech_01', name: 'Python', category: 'Technical', level: 88, icon: 'code', sortOrder: 1 },
  { _id: 'skill_tech_02', name: 'HTML & CSS', category: 'Technical', level: 92, icon: 'layout', sortOrder: 2 },
  { _id: 'skill_tech_03', name: 'JavaScript', category: 'Technical', level: 82, icon: 'cpu', sortOrder: 3 },
  // Professional Skills
  { _id: 'skill_prof_01', name: 'Problem Solving', category: 'Professional', level: 88, icon: 'puzzle', sortOrder: 4 },
  { _id: 'skill_prof_02', name: 'Communication', category: 'Professional', level: 90, icon: 'message-circle', sortOrder: 5 },
  { _id: 'skill_prof_03', name: 'Teamwork', category: 'Professional', level: 92, icon: 'users', sortOrder: 6 },
  // Creative Skills
  { _id: 'skill_creat_01', name: 'Web Design', category: 'Creative', level: 86, icon: 'pen-tool', sortOrder: 7 },
  { _id: 'skill_creat_02', name: 'App Design', category: 'Creative', level: 82, icon: 'smartphone', sortOrder: 8 },
  { _id: 'skill_creat_03', name: 'Creative Thinking', category: 'Creative', level: 90, icon: 'zap', sortOrder: 9 }
];

let inMemoryProjects = JSON.parse(JSON.stringify(initialProjects));
let inMemorySkills = JSON.parse(JSON.stringify(initialSkills));
let inMemoryContacts = [];

module.exports = {
  initialProjects,
  initialSkills,
  inMemoryProjects,
  inMemorySkills,
  inMemoryContacts
};
