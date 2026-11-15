import os
import hashlib
import zlib
import time

def init_git_repo(repo_path, author_name="Shaik Arshiya Begum", author_email="arshiyaaaa55@gmail.com", message="feat: initial release of Shaik Arshiya Begum personal portfolio website"):
    git_dir = os.path.join(repo_path, ".git")
    objects_dir = os.path.join(git_dir, "objects")
    refs_heads_dir = os.path.join(git_dir, "refs", "heads")
    
    os.makedirs(objects_dir, exist_ok=True)
    os.makedirs(refs_heads_dir, exist_ok=True)
    
    # Write HEAD
    with open(os.path.join(git_dir, "HEAD"), "w", encoding="utf-8") as f:
        f.write("ref: refs/heads/main\n")
        
    # Write config
    with open(os.path.join(git_dir, "config"), "w", encoding="utf-8") as f:
        f.write("[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n\tbare = false\n\tlogallrefupdates = true\n\tsymlinks = false\n\tignorecase = true\n")

    # Read .gitignore patterns
    ignore_patterns = [".git", "node_modules", ".env", "venv", "__pycache__", ".DS_Store", "Thumbs.db"]
    gitignore_path = os.path.join(repo_path, ".gitignore")
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            for line in f:
                l = line.strip()
                if l and not l.startswith("#"):
                    ignore_patterns.append(l.rstrip("/"))

    def is_ignored(rel_path):
        parts = rel_path.replace("\\", "/").split("/")
        for p in parts:
            for ign in ignore_patterns:
                if p == ign or p.startswith(ign.rstrip("*")):
                    return True
        return False

    def write_object(obj_type, data):
        header = f"{obj_type} {len(data)}\0".encode("utf-8")
        full_data = header + data
        sha1 = hashlib.sha1(full_data).hexdigest()
        obj_folder = os.path.join(objects_dir, sha1[:2])
        os.makedirs(obj_folder, exist_ok=True)
        obj_file = os.path.join(obj_folder, sha1[2:])
        if not os.path.exists(obj_file):
            with open(obj_file, "wb") as f:
                f.write(zlib.compress(full_data))
        return sha1

    def build_tree(current_dir):
        entries = []
        for item in sorted(os.listdir(current_dir)):
            full_path = os.path.join(current_dir, item)
            rel_path = os.path.relpath(full_path, repo_path)
            if is_ignored(rel_path) or item == ".git":
                continue
            if os.path.isdir(full_path):
                sub_sha1 = build_tree(full_path)
                if sub_sha1:
                    # mode for directory is 040000 -> in tree object: b"40000 " + name + b"\0" + 20-byte-hash
                    entries.append((b"40000", item.encode("utf-8"), bytes.fromhex(sub_sha1)))
            elif os.path.isfile(full_path):
                with open(full_path, "rb") as f:
                    content = f.read()
                blob_sha1 = write_object("blob", content)
                # mode for regular file is 100644 -> in tree object: b"100644 " + name + b"\0" + 20-byte-hash
                entries.append((b"100644", item.encode("utf-8"), bytes.fromhex(blob_sha1)))

        if not entries:
            return None

        tree_data = b""
        for mode, name, sha_bytes in entries:
            tree_data += mode + b" " + name + b"\0" + sha_bytes

        return write_object("tree", tree_data)

    root_tree_sha = build_tree(repo_path)
    if not root_tree_sha:
        print("No files to commit.")
        return

    now = int(time.time())
    tz = "+0530"
    author_str = f"{author_name} <{author_email}> {now} {tz}"
    
    commit_content = f"tree {root_tree_sha}\n"
    commit_content += f"author {author_str}\n"
    commit_content += f"committer {author_str}\n\n"
    commit_content += f"{message}\n"

    commit_sha = write_object("commit", commit_content.encode("utf-8"))

    # Update main branch ref
    with open(os.path.join(refs_heads_dir, "main"), "w", encoding="utf-8") as f:
        f.write(commit_sha + "\n")

    print(f"Git initialized and initial commit created: {commit_sha}")
    return commit_sha

if __name__ == "__main__":
    init_git_repo(r"C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website")
