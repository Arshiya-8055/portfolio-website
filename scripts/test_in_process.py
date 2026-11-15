"""
Shaik Arshiya Begum Portfolio Website
Pure In-Process Mock Runner (Zero-Socket / Sandbox-Safe)
Verifies all 15 REST endpoints and static files without requiring TCP network sockets.
"""
import sys
import os
import io
import json
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dev_server import PortfolioHandler, ADMIN_KEY, projects_db, skills_db, contacts_db, CLIENT_DIR

class MockSocket:
    def __init__(self, rfile_bytes=b""):
        self.rfile = io.BytesIO(rfile_bytes)
        self.wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if 'r' in mode:
            return self.rfile
        elif 'w' in mode:
            return self.wfile
        return self.wfile

class DirectHandler(PortfolioHandler):
    def __init__(self, method, path, headers=None, body=None):
        self.command = method
        self.path = path
        self.request_version = "HTTP/1.1"
        self.close_connection = True
        
        # Format raw request
        raw_headers = f"{method} {path} HTTP/1.1\r\nHost: localhost\r\n"
        body_bytes = b""
        if body is not None:
            if isinstance(body, dict):
                body_bytes = json.dumps(body).encode('utf-8')
                raw_headers += "Content-Type: application/json\r\n"
            elif isinstance(body, str):
                body_bytes = body.encode('utf-8')
            raw_headers += f"Content-Length: {len(body_bytes)}\r\n"

        if headers:
            for k, v in headers.items():
                raw_headers += f"{k}: {v}\r\n"
        raw_headers += "\r\n"

        full_raw = raw_headers.encode('utf-8') + body_bytes
        self.rfile = io.BytesIO(full_raw)
        self.wfile = io.BytesIO()
        self.client_address = ('127.0.0.1', 54321)
        self.server = None
        self.directory = CLIENT_DIR

        # Parse request line and headers
        self.raw_requestline = self.rfile.readline()
        self.parse_request()

    def send_response(self, code, message=None):
        self.response_code = code
        super().send_response(code, message)

def dispatch(method, path, headers=None, body=None):
    handler = DirectHandler(method, path, headers, body)
    if method == 'GET':
        handler.do_GET()
    elif method == 'POST':
        handler.do_POST()
    elif method == 'PUT':
        handler.do_PUT()
    elif method == 'DELETE':
        handler.do_DELETE()
    elif method == 'OPTIONS':
        handler.do_OPTIONS()

    output = handler.wfile.getvalue().decode('utf-8', errors='replace')
    # Parse status and body
    parts = output.split('\r\n\r\n', 1)
    header_part = parts[0]
    body_part = parts[1] if len(parts) > 1 else ""

    status_line = header_part.splitlines()[0] if header_part else "HTTP/1.1 200 OK"
    status_code = int(status_line.split(' ')[1])

    parsed_json = None
    try:
        parsed_json = json.loads(body_part)
    except Exception:
        parsed_json = body_part

    return status_code, parsed_json

def run_tests():
    print("=" * 70)
    print("🧪 Starting Shaik Arshiya Begum Portfolio Verification Suite (In-Process)")
    print("=" * 70)

    passed = 0
    failed = 0

    def check(name, test_fn):
        nonlocal passed, failed
        try:
            test_fn()
            print(f"  ✅ PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  ❌ FAIL: {name} -> {e}")
            failed += 1

    # 1. Health check
    def test_health():
        status, body = dispatch('GET', '/api/health')
        assert status == 200, f"Expected 200, got {status}"
        assert body.get('status') == 'healthy', f"Expected healthy, got {body.get('status')}"
    check("GET /api/health returns healthy system status", test_health)

    # 2. GET /api/projects
    sample_id = None
    def test_projects():
        nonlocal sample_id
        status, body = dispatch('GET', '/api/projects')
        assert status == 200, f"Expected 200, got {status}"
        data = body.get('data', [])
        assert len(data) >= 2, f"Expected at least 2 projects, got {len(data)}"
        sample_id = data[0]['_id']
    check("GET /api/projects returns seeded projects array", test_projects)

    # 3. GET /api/projects?tech=Python
    def test_filter():
        status, body = dispatch('GET', '/api/projects?tech=Python')
        assert status == 200, f"Expected 200, got {status}"
        data = body.get('data', [])
        assert len(data) > 0, "Expected at least 1 Python project"
        for p in data:
            assert any(t.lower() == 'python' for t in p['techStack']), f"Missing Python in {p['title']}"
    check("GET /api/projects?tech=Python filters by technology tag", test_filter)

    # 4. GET /api/projects/:id
    def test_get_id():
        status, body = dispatch('GET', f"/api/projects/{sample_id}")
        assert status == 200, f"Expected 200, got {status}"
        assert str(body['data']['_id']) == str(sample_id), "Project ID mismatch"
    check("GET /api/projects/:id retrieves project by ID", test_get_id)

    # 5. POST /api/projects rejection (no key)
    def test_post_no_key():
        status, body = dispatch('POST', '/api/projects', body={"title": "Unauthorized"})
        assert status == 401, f"Expected 401, got {status}"
    check("POST /api/projects rejects request without x-admin-key (401)", test_post_no_key)

    # 6. POST /api/projects rejection (invalid key)
    def test_post_bad_key():
        status, body = dispatch('POST', '/api/projects', headers={'x-admin-key': 'wrong'}, body={"title": "Test"})
        assert status == 403, f"Expected 403, got {status}"
    check("POST /api/projects rejects request with invalid x-admin-key (403)", test_post_bad_key)

    # 7. POST /api/projects create project with valid key
    new_id = None
    def test_create():
        nonlocal new_id
        payload = {
            "title": "Machine Learning Plant Health Monitor",
            "description": "Developed convolutional neural network to classify leaf pathology in real time.",
            "techStack": ["Python", "TensorFlow", "OpenCV"],
            "githubUrl": "https://github.com/Arshiya-8055/plant-ai",
            "liveUrl": "#",
            "featured": True
        }
        status, body = dispatch('POST', '/api/projects', headers={'x-admin-key': ADMIN_KEY}, body=payload)
        assert status == 201, f"Expected 201, got {status}: {body}"
        new_id = body['data']['_id']
        assert new_id, "Missing _id in created project"
    check("POST /api/projects creates project with valid x-admin-key (201)", test_create)

    # 8. PUT /api/projects/:id update
    def test_update():
        status, body = dispatch('PUT', f"/api/projects/{new_id}", headers={'x-admin-key': ADMIN_KEY}, body={"title": "Updated ML Plant Health Monitor"})
        assert status == 200, f"Expected 200, got {status}"
        assert body['data']['title'] == "Updated ML Plant Health Monitor", "Title not updated"
    check("PUT /api/projects/:id updates project (200)", test_update)

    # 9. DELETE /api/projects/:id delete
    def test_delete():
        status, body = dispatch('DELETE', f"/api/projects/{new_id}", headers={'x-admin-key': ADMIN_KEY})
        assert status == 200, f"Expected 200, got {status}"
    check("DELETE /api/projects/:id deletes project (200)", test_delete)

    # 10. GET /api/skills
    def test_skills():
        status, body = dispatch('GET', '/api/skills')
        assert status == 200, f"Expected 200, got {status}"
        cats = body.get('data', {})
        assert 'Technical' in cats and 'Professional' in cats and 'Creative' in cats, "Missing skill categories"
    check("GET /api/skills returns grouped categories (Technical, Professional, Creative)", test_skills)

    # 11. POST /api/contact validation error
    def test_contact_fail():
        invalid = {"name": "", "email": "bad", "subject": "", "message": ""}
        status, body = dispatch('POST', '/api/contact', body=invalid)
        assert status == 400, f"Expected 400, got {status}"
        assert len(body.get('errors', [])) > 0, "Missing validation error messages"
    check("POST /api/contact rejects invalid contact payload (400)", test_contact_fail)

    # 12. POST /api/contact success
    def test_contact_pass():
        valid = {
            "name": "Arshiya Begum",
            "email": "arshiyaaaa55@gmail.com",
            "subject": "Portfolio Contact Test",
            "message": "Testing contact form functionality and database persistence."
        }
        status, body = dispatch('POST', '/api/contact', body=valid)
        assert status == 201, f"Expected 201, got {status}"
        assert body.get('status') == 'success', "Status not success"
    check("POST /api/contact saves valid contact message (201)", test_contact_pass)

    # 13. Static files: GET /
    def test_index_file():
        status, body = dispatch('GET', '/')
        assert status == 200, f"Expected 200, got {status}"
        assert "Shaik Arshiya Begum" in str(body), "index.html missing name"
    check("Static files: GET / serves index.html (200)", test_index_file)

    # 14. Static files: GET /admin
    def test_admin_file():
        status, body = dispatch('GET', '/admin')
        assert status == 200, f"Expected 200, got {status}"
        assert "Admin Unlock" in str(body) or "Portfolio Management Dashboard" in str(body), "admin.html missing content"
    check("Static files: GET /admin serves admin.html (200)", test_admin_file)

    # 15. Static files: GET /css/style.css
    def test_style_file():
        status, body = dispatch('GET', '/css/style.css')
        assert status == 200, f"Expected 200, got {status}"
        assert "--font-heading" in str(body), "style.css missing tokens"
    check("Static files: GET /css/style.css serves valid CSS (200)", test_style_file)

    print("=" * 70)
    print(f"📊 Test Results: {passed} Passed, {failed} Failed")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)
    else:
        print("🎉 All 15 Endpoints & Integration Checks Verified Successfully!")
        sys.exit(0)

if __name__ == '__main__':
    run_tests()
