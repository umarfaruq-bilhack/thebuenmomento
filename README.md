# TheBuenMomento — Deploy Guide

## Project Structure
```
tbm/
├── public/index.html      ← terminal form (users)
├── admin/index.html       ← admin dashboard
├── api/
│   ├── save-agent.js      ← POST /api/save-agent
│   ├── get-agents.js      ← GET  /api/get-agents  (admin only)
│   ├── get-config.js      ← GET  /api/get-config  (public)
│   └── update-config.js   ← POST /api/update-config (admin only)
├── package.json
├── vercel.json
└── README.md
```

---

## STEP 1 — Firebase Setup

1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `thebuenmomento`
3. Disable Google Analytics (not needed) → Create project

### Firestore
4. Left menu → Build → Firestore Database
5. Click "Create database" → Start in **production mode** → choose region → Enable
6. Rules tab → paste this and Publish:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /agents/{id} { allow write: if true; allow read: if false; }
    match /config/{id} { allow read: if true; allow write: if false; }
  }
}
```

### Service Account (for API)
7. Project Settings (gear icon) → Service accounts
8. Click "Generate new private key" → download the JSON file
9. Open the JSON — you need these 3 values:
   - `project_id`
   - `client_email`
   - `private_key`

---

## STEP 2 — GitHub

```bash
cd tbm
git init
git add .
git commit -m "initial launch"

# create repo at github.com then:
git remote add origin https://github.com/YOURUSERNAME/thebuenmomento.git
git branch -M main
git push -u origin main
```

---

## STEP 3 — Vercel Deploy

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select your `thebuenmomento` repo
3. Framework: **Other**  
4. Root directory: leave as `/`
5. Click **Environment Variables** and add these 4:

| Name | Value |
|------|-------|
| `FIREBASE_PROJECT_ID` | your project_id from service account JSON |
| `FIREBASE_CLIENT_EMAIL` | your client_email |
| `FIREBASE_PRIVATE_KEY` | your private_key (include the -----BEGIN----- lines) |
| `ADMIN_SECRET_KEY` | make up a strong password e.g. `TBM_admin_2025_xK9` |

6. Click **Deploy**

Your site will be live at `https://yourproject.vercel.app`

---

## STEP 4 — Set Up Admin Panel

1. Go to `https://yoursite.vercel.app/admin`
2. Click **CONFIG** tab
3. Enter your `ADMIN_SECRET_KEY` in the "Admin Secret Key" field → click SAVE KEY LOCALLY
4. Now all buttons work: refresh agents, save tweet, set timer, toggle form

---

## STEP 5 — Update Tweet Link from Admin

1. Admin → CONFIG tab
2. Paste your tweet URL into "TWEET URL" field
3. Click **[ SAVE TWEET LINK ]**
4. The form immediately picks up the new tweet ID — no redeploy needed

---

## STEP 6 — Set Form Timer

1. Admin → CONFIG tab → FORM TIMER section
2. Set **Open At** — date/time form becomes accessible
3. Set **Close At** — date/time form closes automatically
4. Click **[ SAVE TIMER ]**

Visitors see a live countdown timer until open time. After close time they see "TRANSMISSION WINDOW CLOSED".

**Manual override**: Use the toggle switch to instantly open or close the form regardless of timer.

---

## STEP 7 — View & Export Agents

1. Admin → AGENTS tab → click **[ REFRESH ]** to load from Firebase
2. Click any row to see full agent details (wallet, quote link, contribution)
3. Click **[ EXPORT CSV ]** to download all data

---

## Local Testing

Just open files directly — no server needed for frontend testing:
```bash
open public/index.html    # terminal form
open admin/index.html     # admin panel
```

For API testing (requires Node.js):
```bash
npm install
npx vercel dev
# → http://localhost:3000
```

