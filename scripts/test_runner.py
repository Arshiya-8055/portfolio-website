"""
Shaik Arshiya Begum Portfolio Website
Automated In-Process Integration Test Suite
Verifies all 15 core REST endpoints and functional requirements.
"""
import sys
import os
import threading
import time
import urllib.request
import urllib.error
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dev_server import HTTPServer, PortfolioHandler, ADMIN_KEY

TEST_PORT = 5055
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"

def start_test_server():
    server = HTTPServer(('127.0.0.1', TEST_PORT), PortfolioHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.5)
    return server

def http_request(url, method='GET', headers=None, data=None):
    if headers is None:
        headers = {}
    encoded_data = None
    if data is not None:
        if isinstance(data, dict):
            encoded_data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        elif isinstance(data, str):
            encoded_data = data.encode('utf-8')

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            try:
                parsed = json.loads(res_body)
            except Exception:
                parsed = res_body
            return response.status, parsed
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = err_body
        return e.code, parsed

def run_all_tests():
    print("=" * 70)
    print("🧪 Starting Shaik Arshiya Begum Portfolio Verification Suite")
    print("=" * 70)

    server = start_test_server()
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
        status, body = http_request(f"{BASE_URL}/api/health")
        assert status == 200, f"Expected 200, got {status}"
        assert body.get('status') == 'healthy', f"Expected status healthy, got {body.get('status')}"
    check("GET /api/health returns healthy system status", test_health)

    # 2. GET /api/projects
    sample_id = None
    def test_get_projects():
        nonlocal sample_id
        status, body = http_request(f"{BASE_URL}/api/projects")
        assert status == 200, f"Expected 200, got {status}"
        projects = body.get('data', [])
        assert len(projects) >= 2, f"Expected at least 2 projects, got {len(projects)}"
        sample_id = projects[0]['_id']
    check("GET /api/projects returns seeded projects array", test_get_projects)

    # 3. GET /api/projects?tech=Python
    def test_tech_filter():
        status, body = http_request(f"{BASE_URL}/api/projects?tech=Python")
        assert status == 200, f"Expected 200, got {status}"
        projects = body.get('data', [])
        assert len(projects) > 0, "Expected at least 1 Python project"
        for p in projects:
            assert any(t.lower() == 'python' for t in p['techStack']), f"Project {p['title']} missing Python"
    check("GET /api/projects?tech=Python filters by technology tag", test_tech_filter)

    # 4. GET /api/projects/:id
    def test_get_project_by_id():
        status, body = http_request(f"{BASE_URL}/api/projects/{sample_id}")
        assert status == 200, f"Expected 200, got {status}"
        assert str(body['data']['_id']) == str(sample_id), "Project ID mismatch"
    check("GET /api/projects/:id retrieves project by ID", test_get_project_by_id)

    # 5. POST /api/projects auth rejection (no key)
    def test_post_no_auth():
        status, body = http_request(f"{BASE_URL}/api/projects", method='POST', data={"title": "Test"})
        assert status == 401, f"Expected 401, got {status}"
    check("POST /api/projects rejects request without x-admin-key (401)", test_post_no_auth)

    # 6. POST /api/projects auth rejection (invalid key)
    def test_post_bad_auth():
        status, body = http_request(f"{BASE_URL}/api/projects", method='POST', headers={'x-admin-key': 'wrong-key'}, data={"title": "Test"})
        assert status == 403, f"Expected 403, got {status}"
    check("POST /api/projects rejects request with invalid x-admin-key (403)", test_post_bad_auth)

    # 7. POST /api/projects create project with valid key
    new_created_id = None
    def test_create_project():
        nonlocal new_created_id
        payload = {
            "title": "Automated Test Project",
            "description": "Created by automated integration test runner to verify API functionality.",
            "techStack": ["Node.js", "Express", "MongoDB"],
            "githubUrl": "https://github.com/Arshiya-8055/test",
            "liveUrl": "#",
            "featured": False
        }
        status, body = http_request(f"{BASE_URL}/api/projects", method='POST', headers={'x-admin-key': ADMIN_KEY}, data=payload)
        assert status == 201, f"Expected 201, got {status}: {body}"
        new_created_id = body['data']['_id']
        assert new_created_id, "Missing _id in created project"
    check("POST /api/projects creates project with valid x-admin-key (201)", test_create_project)

    # 8. PUT /api/projects/:id update project
    def test_update_project():
        update_payload = {"title": "Updated Test Project Title", "featured": True}
        status, body = http_request(f"{BASE_URL}/api/projects/{new_created_id}", method='PUT', headers={'x-admin-key': ADMIN_KEY}, data=update_payload)
        assert status == 200, f"Expected 200, got {status}"
        assert body['data']['title'] == "Updated Test Project Title", "Title was not updated"
    check("PUT /api/projects/:id updates project (200)", test_update_project)

    # 9. DELETE /api/projects/:id delete project
    def test_delete_project():
        status, body = http_request(f"{BASE_URL}/api/projects/{new_created_id}", method='DELETE', headers={'x-admin-key': ADMIN_KEY})
        assert status == 200, f"Expected 200, got {status}"
    check("DELETE /api/projects/:id deletes project (200)", test_delete_project)

    # 10. GET /api/skills
    def test_get_skills():
        status, body = http_request(f"{BASE_URL}/api/skills")
        assert status == 200, f"Expected 200, got {status}"
        data = body.get('data', {})
        assert 'Technical' in data and 'Professional' in data and 'Creative' in data, "Skills missing expected categories"
        assert len(data['Technical']) >= 3, "Technical skills list is incomplete"
    check("GET /api/skills returns grouped categories (Technical, Professional, Creative)", test_get_skills)

    # 11. POST /api/contact validation error
    def test_contact_validation():
        invalid = {"name": "A", "email": "invalid-email", "subject": "", "message": ""}
        status, body = http_request(f"{BASE_URL}/api/contact", method='POST', data=invalid)
        assert status == 400, f"Expected 400, got {status}"
        assert len(body.get('errors', [])) > 0, "Expected validation errors"
    check("POST /api/contact rejects invalid contact payload (400)", test_contact_validation)

    # 12. POST /api/contact success
    def test_contact_success():
        valid = {
            "name": "Arshiya Recruiter",
            "email": "recruiter@example.com",
            "subject": "AI/ML Developer Opportunity",
            "message": "Hello Shaik Arshiya Begum, we are impressed with your portfolio!"
        }
        status, body = http_request(f"{BASE_URL}/api/contact", method='POST', data=valid)
        assert status == 201, f"Expected 201, got {status}"
        assert body.get('status') == 'success', "Status is not success"
    check("POST /api/contact saves valid contact message (201)", test_contact_success)

    # 13. Static files: GET /
    def test_static_index():
        status, body = http_request(f"{BASE_URL}/")
        assert status == 200, f"Expected 200, got {status}"
        assert "Shaik Arshiya Begum" in str(body), "index.html missing name"
    check("Static files: GET / serves index.html (200)", test_static_index)

    # 14. Static files: GET /admin
    def test_static_admin():
        status, body = http_request(f"{BASE_URL}/admin")
        assert status == 200, f"Expected 200, got {status}"
        assert "Admin Unlock" in str(body) or "Portfolio Management Dashboard" in str(body), "admin.html missing expected title"
    check("Static files: GET /admin serves admin.html (200)", test_static_admin)

    # 15. Static files: GET /css/style.css
    def test_static_css():
        status, body = http_request(f"{BASE_URL}/css/style.css")
        assert status == 200, f"Expected 200, got {status}"
        assert "--font-heading" in str(body), "style.css content check failed"
    check("Static files: GET /css/style.css serves valid CSS (200)", test_static_css)

    print("=" * 70)
    print(f"📊 Test Summary: {passed} Passed, {failed} Failed")
    print("=" * 70)

    server.shutdown()
    if failed > 0:
        sys.exit(1)
    else:
        print("🎉 All 15 Endpoints & Integration Checks Verified Successfully!")
        sys.exit(0)

if __name__ == '__main__':
    run_all_tests()
