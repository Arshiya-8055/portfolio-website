"""
Companion Development Server & Mock API Engine
Shaik Arshiya Begum - Personal Portfolio Website
Provides instant zero-setup local execution using Python's standard library.
Mirrors the exact Node.js Express REST API contract.
"""
import os
import sys
import json
import time
import re
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_DIR = os.path.join(BASE_DIR, 'client')
ENV_FILE = os.path.join(BASE_DIR, '.env')

# Load .env
env_vars = {
    'PORT': '5000',
    'ADMIN_KEY': 'arshiya-portfolio-admin-secret-2026',
    'MONGODB_URI': ''
}
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env_vars[k.strip()] = v.strip()

PORT = int(os.environ.get('PORT', env_vars.get('PORT', 5000)))
ADMIN_KEY = os.environ.get('ADMIN_KEY', env_vars.get('ADMIN_KEY', 'arshiya-portfolio-admin-secret-2026'))

# Initial dataset matching server/models/dataStore.js
projects_db = [
    {
        "_id": "proj_academic_01",
        "title": "College Academic Projects",
        "description": "Completed internal academic assignments and practical tasks as part of my B.Tech coursework in Artificial Intelligence & Machine Learning.",
        "techStack": ["Python", "C", "HTML", "CSS"],
        "githubUrl": "https://github.com/Arshiya-8055",
        "liveUrl": "https://github.com/Arshiya-8055",
        "imageUrl": "assets/projects/academic.svg",
        "featured": True,
        "createdAt": "2025-10-15T10:00:00Z"
    },
    {
        "_id": "proj_portfolio_02",
        "title": "Personal Portfolio Website",
        "description": "Developing a personal portfolio website to showcase my education, skills, interests, and work with a modern responsive UI, REST API, and MongoDB integration.",
        "techStack": ["HTML", "CSS", "JavaScript", "Node.js", "Express", "MongoDB"],
        "githubUrl": "https://github.com/Arshiya-8055",
        "liveUrl": "/",
        "imageUrl": "assets/projects/portfolio.svg",
        "featured": True,
        "createdAt": "2026-01-20T12:00:00Z"
    },
    {
        "_id": "proj_placeholder_03",
        "title": "[Placeholder] AI & ML Predictive Analytics",
        "description": "Predictive data exploration and classification modeling developed during B.Tech coursework. (Placeholder - customize with your capstone or upcoming AI project).",
        "techStack": ["Python", "Machine Learning", "Data Analysis"],
        "githubUrl": "https://github.com/Arshiya-8055",
        "liveUrl": "https://github.com/Arshiya-8055",
        "imageUrl": "assets/projects/ai_project.svg",
        "featured": False,
        "createdAt": "2026-03-01T09:00:00Z"
    }
]

skills_db = {
    "Technical": [
        {"_id": "skill_tech_01", "name": "Python", "category": "Technical", "level": 88, "icon": "code", "sortOrder": 1},
        {"_id": "skill_tech_02", "name": "HTML & CSS", "category": "Technical", "level": 92, "icon": "layout", "sortOrder": 2},
        {"_id": "skill_tech_03", "name": "JavaScript", "category": "Technical", "level": 82, "icon": "cpu", "sortOrder": 3}
    ],
    "Professional": [
        {"_id": "skill_prof_01", "name": "Problem Solving", "category": "Professional", "level": 88, "icon": "puzzle", "sortOrder": 4},
        {"_id": "skill_prof_02", "name": "Communication", "category": "Professional", "level": 90, "icon": "message-circle", "sortOrder": 5},
        {"_id": "skill_prof_03", "name": "Teamwork", "category": "Professional", "level": 92, "icon": "users", "sortOrder": 6}
    ],
    "Creative": [
        {"_id": "skill_creat_01", "name": "Web Design", "category": "Creative", "level": 86, "icon": "pen-tool", "sortOrder": 7},
        {"_id": "skill_creat_02", "name": "App Design", "category": "Creative", "level": 82, "icon": "smartphone", "sortOrder": 8},
        {"_id": "skill_creat_03", "name": "Creative Thinking", "category": "Creative", "level": 90, "icon": "zap", "sortOrder": 9}
    ]
}

contacts_db = []
rate_limit_map = {}

class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CLIENT_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status_code, data):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw_body)
        except Exception:
            return {}

    def is_authenticated(self):
        header_key = self.headers.get('x-admin-key')
        auth_header = self.headers.get('Authorization', '')
        bearer_key = None
        if auth_header.startswith('Bearer '):
            bearer_key = auth_header[7:].strip()
        key = header_key or bearer_key
        return key == ADMIN_KEY

    def check_rate_limit(self, max_req=5, window_sec=600):
        client_ip = self.client_address[0]
        now = time.time()
        timestamps = rate_limit_map.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < window_sec]
        if len(timestamps) >= max_req:
            rate_limit_map[client_ip] = timestamps
            return False
        timestamps.append(now)
        rate_limit_map[client_ip] = timestamps
        return True

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Health
        if path == '/api/health':
            return self.send_json(200, {
                "status": "healthy",
                "app": "Shaik Arshiya Begum Portfolio API",
                "version": "1.0.0",
                "database": {
                    "connected": True,
                    "provider": "MongoDB Atlas Ready (In-Memory Active)",
                    "readyState": 1
                },
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })

        # Skills
        if path == '/api/skills':
            category_filter = query.get('category', [None])[0]
            if category_filter:
                filtered = {category_filter: skills_db.get(category_filter, [])}
                return self.send_json(200, {"status": "success", "data": filtered})
            return self.send_json(200, {"status": "success", "data": skills_db})

        # Projects list
        if path == '/api/projects':
            tech = query.get('tech', [None])[0]
            featured = query.get('featured', [None])[0]

            results = list(projects_db)
            if tech and tech.lower() != 'all':
                results = [
                    p for p in results 
                    if any(t.lower() == tech.lower() for t in p.get('techStack', []))
                ]
            if featured is not None:
                is_feat = featured.lower() == 'true'
                results = [p for p in results if p.get('featured', False) == is_feat]

            return self.send_json(200, {
                "status": "success",
                "count": len(results),
                "data": results
            })

        # Single project by ID
        m = re.match(r'^/api/projects/([^/]+)$', path)
        if m:
            proj_id = m.group(1)
            for p in projects_db:
                if str(p['_id']) == str(proj_id):
                    return self.send_json(200, {"status": "success", "data": p})
            return self.send_json(404, {"status": "error", "message": f"Project {proj_id} not found."})

        # Admin route alias
        if path == '/admin':
            admin_path = os.path.join(CLIENT_DIR, 'admin.html')
            if os.path.exists(admin_path):
                self.path = '/admin.html'
                return super().do_GET()

        # Fallback to static handler
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # Submit Contact
        if path == '/api/contact':
            if not self.check_rate_limit(max_req=5, window_sec=600):
                return self.send_json(429, {
                    "status": "error",
                    "message": "Too many contact messages submitted. Please wait before retrying."
                })

            name = body.get('name', '').strip()
            email = body.get('email', '').strip()
            subject = body.get('subject', '').strip()
            message = body.get('message', '').strip()

            errors = []
            if len(name) < 2:
                errors.append("Full name must be at least 2 characters long.")
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                errors.append("Please provide a valid email address.")
            if len(subject) < 2:
                errors.append("Subject must be at least 2 characters long.")
            if len(message) < 5:
                errors.append("Message must contain at least 5 characters.")

            if errors:
                return self.send_json(400, {
                    "status": "error",
                    "message": "Validation failed",
                    "errors": errors
                })

            entry = {
                "_id": f"msg_{int(time.time()*1000)}",
                "name": name,
                "email": email,
                "subject": subject,
                "message": message,
                "ip": self.client_address[0],
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            contacts_db.append(entry)
            return self.send_json(201, {
                "status": "success",
                "message": "Thank you, Shaik Arshiya Begum will review your message soon!",
                "data": entry
            })

        # Create Project
        if path == '/api/projects':
            if not self.headers.get('x-admin-key') and not self.headers.get('Authorization'):
                return self.send_json(401, {"status": "error", "message": "Access Denied: Missing Admin Key."})

            if not self.is_authenticated():
                return self.send_json(403, {"status": "error", "message": "Forbidden: Invalid Admin Key supplied."})

            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            tech_stack = body.get('techStack', [])

            errors = []
            if len(title) < 2:
                errors.append("Project title must be at least 2 characters long.")
            if len(description) < 5:
                errors.append("Project description must be at least 5 characters long.")

            if errors:
                return self.send_json(400, {"status": "error", "message": "Validation failed", "errors": errors})

            new_project = {
                "_id": f"proj_{int(time.time()*1000)}",
                "title": title,
                "description": description,
                "techStack": tech_stack if isinstance(tech_stack, list) else [s.strip() for s in str(tech_stack).split(',')],
                "githubUrl": body.get('githubUrl', 'https://github.com/Arshiya-8055'),
                "liveUrl": body.get('liveUrl', '#'),
                "imageUrl": body.get('imageUrl', 'assets/projects/academic.svg'),
                "featured": bool(body.get('featured', False)),
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            projects_db.insert(0, new_project)
            return self.send_json(201, {
                "status": "success",
                "message": "Project created successfully",
                "data": new_project
            })

        return self.send_json(404, {"status": "error", "message": f"Cannot POST {path}"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        m = re.match(r'^/api/projects/([^/]+)$', path)
        if m:
            if not self.headers.get('x-admin-key') and not self.headers.get('Authorization'):
                return self.send_json(401, {"status": "error", "message": "Access Denied: Missing Admin Key."})
            if not self.is_authenticated():
                return self.send_json(403, {"status": "error", "message": "Forbidden: Invalid Admin Key supplied."})

            proj_id = m.group(1)
            for idx, p in enumerate(projects_db):
                if str(p['_id']) == str(proj_id):
                    for k, v in body.items():
                        if k != '_id':
                            p[k] = v
                    return self.send_json(200, {
                        "status": "success",
                        "message": "Project updated successfully",
                        "data": p
                    })
            return self.send_json(404, {"status": "error", "message": f"Project {proj_id} not found."})

        return self.send_json(404, {"status": "error", "message": f"Cannot PUT {path}"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        m = re.match(r'^/api/projects/([^/]+)$', path)
        if m:
            if not self.headers.get('x-admin-key') and not self.headers.get('Authorization'):
                return self.send_json(401, {"status": "error", "message": "Access Denied: Missing Admin Key."})
            if not self.is_authenticated():
                return self.send_json(403, {"status": "error", "message": "Forbidden: Invalid Admin Key supplied."})

            proj_id = m.group(1)
            for idx, p in enumerate(projects_db):
                if str(p['_id']) == str(proj_id):
                    deleted = projects_db.pop(idx)
                    return self.send_json(200, {
                        "status": "success",
                        "message": "Project deleted successfully",
                        "data": deleted
                    })
            return self.send_json(404, {"status": "error", "message": f"Project {proj_id} not found."})

        return self.send_json(404, {"status": "error", "message": f"Cannot DELETE {path}"})

def run_server(port=PORT):
    server = HTTPServer(('127.0.0.1', port), PortfolioHandler)
    print("=" * 65)
    print("🚀 Shaik Arshiya Begum — Personal Portfolio Local Server")
    print("=" * 65)
    print(f"📡 Local Website URL:  http://localhost:{port}")
    print(f"🌐 Admin Dashboard:    http://localhost:{port}/admin")
    print(f"📊 Health Endpoint:    http://localhost:{port}/api/health")
    print(f"📦 Projects API:       http://localhost:{port}/api/projects")
    print(f"🎯 Skills API:         http://localhost:{port}/api/skills")
    print("=" * 65)
    print("💡 Press Ctrl+C in terminal to stop the server at any time.")
    print("=" * 65)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.server_close()

if __name__ == '__main__':
    run_server()
