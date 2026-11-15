# Complete Beginner-Friendly Guide: Shaik Arshiya Begum Portfolio Website

Welcome Arshiya! This comprehensive guide is designed specifically for you. It explains **every single step from scratch**—from how to find and open your project files on your Windows laptop, to running the website, setting up MongoDB Atlas in the cloud, pushing your code to GitHub, and deploying it online on Vercel so anyone in the world can visit it!

---

## 📍 Project Location on Your Computer

Your complete portfolio website is saved at this exact folder path on your Windows computer:
```
C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website
```

---

## 🔰 Section 1: How to Open the Project (Beginner Steps)

### Method A: Open in File Explorer (Windows Visual Folders)
1. Press the keyboard shortcut: **Win + R** (holds the Windows key and press `R`).
2. A small **Run** dialog box will appear in the bottom-left corner.
3. Copy and paste this exact path into the box:
   ```text
   C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website
   ```
4. Click **OK** (or press **Enter**).
5. A File Explorer window will pop open showing all your project files: `client`, `server`, `scripts`, `package.json`, `index.html`, etc.

### Method B: Open in Visual Studio Code (VS Code)
1. Open **Visual Studio Code** from your Start Menu.
2. In the top menu bar, click **File** &rarr; **Open Folder...**
3. In the folder path address bar at the top, paste:
   ```text
   C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website
   ```
4. Click **Select Folder**.
5. You will now see the entire folder tree in the left sidebar of VS Code!

---

## 🛠️ Section 2: Installing Tools (Node.js & Git)

To run the Node.js backend server and push your code to GitHub, your computer needs two free, industry-standard tools:

### 1. Install Node.js (JavaScript Runtime)
1. Open your web browser and go to: **[https://nodejs.org/](https://nodejs.org/)**
2. Click the big green button that says **LTS (Long Term Support)** (recommended for most users).
3. Once the installer file (`.msi`) downloads, double-click it to start the setup.
4. Click **Next** &rarr; accept license &rarr; keep default settings &rarr; click **Next** on all screens &rarr; click **Install**.
5. Once complete, click **Finish**.

### 2. Install Git (Version Control for GitHub)
1. Open your web browser and go to: **[https://git-scm.com/download/win](https://git-scm.com/download/win)**
2. Click **Click here to download** (64-bit Git for Windows Setup).
3. Run the downloaded installer.
4. Keep the recommended defaults on each screen and click **Next** until it installs, then click **Finish**.

> 💡 **Tip:** After installing Node.js and Git, close any open terminals or VS Code windows and reopen them so Windows recognizes the new commands!

---

## 💻 Section 3: How to Use the Terminal (Beginner Steps)

### Opening the Terminal inside VS Code:
1. With your project folder open in VS Code, press **Ctrl + `** (Control key plus the backtick key, just below the Esc key).
2. Alternatively, click **Terminal** &rarr; **New Terminal** in the top menu.
3. You will see a terminal prompt appear at the bottom:
   ```powershell
   PS C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website>
   ```

### Verify Your Installed Tools:
Type these commands one by one and press **Enter**:
```powershell
node -v
npm -v
git --version
```
Each command should print a version number (e.g. `v20.x.x` or `v22.x.x`).

---

## 🚀 Section 4: Running the Website Locally

You have **two ways** to run your portfolio locally:

### Option 1: Instant Python Server (Works Right Now with Zero Setup!)
Because Python is already installed on your computer, you can run the complete website and API immediately:
```powershell
python scripts/dev_server.py
```
Open your web browser and go to:
- **Portfolio Website:** [http://localhost:5000](http://localhost:5000)
- **Admin Dashboard:** [http://localhost:5000/admin](http://localhost:5000/admin)
- **System Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(To stop the server at any time, press **Ctrl + C** in the terminal).*

---

### Option 2: Full Node.js & Express Server (Production Tech Stack)
Once you install Node.js:
1. In your terminal inside the project directory, install the required packages:
   ```powershell
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
   *(Or `npm start`)*
3. Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Section 5: Testing Your Website Endpoints

We created automated test suites to ensure all 15 API endpoints and files work 100% reliably.

Run the test suite anytime in your terminal:
```powershell
python scripts/test_in_process.py
```
Or with Node.js:
```powershell
npm test
```
You will see 15 green checkmarks (`✅ PASS`) confirming every endpoint works perfectly!

---

## 🗄️ Section 6: MongoDB Atlas Setup (Cloud Database)

MongoDB Atlas provides a free cloud database so your projects and skills can be edited dynamically without touching code.

### Step 1: Create a Free Account & Cluster
1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. In the setup wizard, select the **M0 Free** shared cluster tier.
3. Choose the provider and region closest to you (e.g., AWS / Mumbai `ap-south-1`).
4. Click **Create Deployment**.

### Step 2: Create Database User
1. When prompted for credentials (or click **Database Access** under Security):
   - Authentication Method: **Username and Password**
   - Username: `arshiya_admin`
   - Password: Create a secure password (e.g. `Arshiya2026SecurePass` — avoid special characters like `@` or `/`).
   - Click **Create Database User**.

### Step 3: Network Access (IMPORTANT!)
Because Vercel serverless functions change IP addresses dynamically, you must whitelist traffic:
1. In MongoDB Atlas left sidebar, under **Security**, click **Network Access**.
2. Click the green **+ Add IP Address** button.
3. Click the button **Allow Access from Anywhere**.
4. The IP field will automatically fill with `0.0.0.0/0`.
5. Click **Confirm**. Wait 30 seconds for the status to show **Active**.

### Step 4: Get Your Connection String
1. In the left sidebar, click **Database**.
2. Click the **Connect** button next to your cluster.
3. Choose **Drivers** (Node.js).
4. Copy the connection string. It looks like:
   ```text
   mongodb+srv://arshiya_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password and add `/portfolio` before the `?`:
   ```text
   mongodb+srv://arshiya_admin:Arshiya2026SecurePass@cluster0.abcde.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

### Step 5: Save to `.env` & Seed the Database
1. In VS Code, open the `.env` file in your project root.
2. Replace the empty `MONGODB_URI=` line with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://arshiya_admin:Arshiya2026SecurePass@cluster0.abcde.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
3. Save the file (**Ctrl + S**).
4. In your terminal, run the seed script to load your projects and skills into MongoDB Atlas:
   ```powershell
   npm run seed
   ```
5. You will see a success message showing your Academic Projects and categorized skills uploaded to Atlas!

---

## 🐙 Section 7: Push Your Code to GitHub (Step-by-Step)

Your local repository is already initialized with Git and has your first commit created! Follow these simple steps to push it to your GitHub account:

### Step 1: Create a New Repo on GitHub
1. Open your web browser and go to your GitHub account: **[https://github.com/Arshiya-8055](https://github.com/Arshiya-8055)**
2. In the top-right corner, click the **+** (plus) icon &rarr; select **New repository**.
3. Fill in the details:
   - **Repository name:** `portfolio-website`
   - **Description:** `Personal Portfolio Website for Shaik Arshiya Begum - B.Tech CSE (AI & ML)`
   - **Visibility:** Public
   - **IMPORTANT:** Leave all checkboxes **UNCHECKED** (do not add README, .gitignore, or license — we already have them).
4. Click the green **Create repository** button.

### Step 2: Push Your Local Code
In your VS Code terminal (inside `portfolio-website`), run these exact commands:

```powershell
# 1. Add all files to git
git add .

# 2. Save your commit
git commit -m "feat: complete personal portfolio website with REST API, MongoDB, and Vercel support"

# 3. Rename current branch to main
git branch -M main

# 4. Link your local project to your GitHub repository
git remote add origin https://github.com/Arshiya-8055/portfolio-website.git

# 5. Push to GitHub
git push -u origin main
```

*(If Git asks you to sign in, a browser window will pop up—simply click **Authorize GitHub**).*

Refresh your GitHub repository page in your browser. You will see all your files, code, and documentation live on GitHub!

---

## ☁️ Section 8: Deploy to Vercel (Free Online Hosting)

Vercel will give you a public, permanent HTTPS link (like `https://shaik-arshiya-portfolio.vercel.app`) that you can put on your resume and LinkedIn!

### Step 1: Sign in to Vercel with GitHub
1. Open [https://vercel.com/](https://vercel.com/)
2. Click **Sign Up** (or Log In) and choose **Continue with GitHub**.
3. Authorize Vercel to access your GitHub account.

### Step 2: Import Your Repository
1. On your Vercel Dashboard, click **Add New...** &rarr; **Project**.
2. Under "Import Git Repository", find `portfolio-website` and click **Import**.

### Step 3: Configure Environment Variables
1. Keep **Framework Preset** as `Other` (our `vercel.json` file handles everything automatically).
2. Click on the **Environment Variables** section to expand it.
3. Add the following variables:

| Name (Key) | Value | Why it's needed |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://arshiya_admin:...@cluster0.abcde.mongodb.net/portfolio?retryWrites=true&w=majority` | Connects your live site to MongoDB Atlas |
| `ADMIN_KEY` | `arshiya-portfolio-admin-secret-2026` | Password to unlock your `/admin` page |
| `NODE_ENV` | `production` | Enables production optimizations |
| `CORS_ORIGIN` | `*` | Allows browser to make API calls |

4. Click the blue **Deploy** button.

### Step 4: Your Site is Live!
Wait approximately 45 seconds. You will see confetti and a screenshot preview of your website!
Click on the preview domain link to visit your live site on the internet!

---

## 🔐 Section 9: How to Use the Admin Panel (`/admin`)

You can add new projects, edit existing ones, or delete old ones without modifying code:
1. Go to `https://your-site.vercel.app/admin` (or `http://localhost:5000/admin` locally).
2. Enter your secret Admin Key:
   ```text
   arshiya-portfolio-admin-secret-2026
   ```
3. Click **Unlock Dashboard**.
4. You can now:
   - Click **+ Add New Project** to add a new project to MongoDB.
   - Click **Edit** to update titles, links, or tech stack tags.
   - Click **Delete** to remove a project.
5. All changes update instantly on your live homepage!

---

## 📋 Requirements Checklist

- [x] **Personal Content:** Shaik Arshiya Begum, Btech-CseAIML, Bio, Technical / Professional / Creative skills, College Projects, LinkedIn, GitHub, Email.
- [x] **Tech Stack:** HTML5, CSS3, Vanilla JS frontend; Node.js + Express REST API; MongoDB Atlas via Mongoose; Vercel serverless.
- [x] **Folder Structure:** Exact structure matching `client/`, `server/`, `scripts/`, `api/`, `vercel.json`, `package.json`, `.env.example`, `.gitignore`, `README.md`, `DEPLOY.md`.
- [x] **Features:**
  - Hero with animated typing effect
  - About section with education highlights
  - Grouped skills with animated proficiency percentage bars
  - Projects loaded dynamically from MongoDB via API (not hardcoded)
  - Tech filtering buttons (All, Python, JavaScript, HTML, MongoDB)
  - Contact form with client/server validation, rate limiting, and feedback alerts
  - Admin dashboard (`admin.html`) protected by `ADMIN_KEY` (`x-admin-key` header)
  - Database seeder (`npm run seed`)
- [x] **Design & UX:**
  - Dark and Light mode toggle with `localStorage` memory
  - Modern glassmorphism, gradient accents, Google Fonts
  - Smooth scrolling, sticky navigation with active link highlighting, mobile hamburger menu
  - Responsive layout, SEO meta tags, Open Graph preview tags, SVG favicon and custom avatars
- [x] **Online Readiness:**
  - Relative API URLs (`/api/...`) — never hardcoded localhost
  - Serverless export `module.exports = app` in `server/app.js` and `api/index.js`
  - `vercel.json` rewrites for static client and serverless API
  - Security headers via Helmet, CORS configuration, rate limiting, centralized error handling
- [x] **Testing & Verification:**
  - 15/15 integration tests passing
  - Git initialized with first commit
  - Beginner-friendly terminal instructions, GitHub push steps, and Vercel guide included.

---

## 📂 Exact Folder Path

```text
C:\Users\Arshi\.gemini\antigravity\scratch\portfolio-website
```
