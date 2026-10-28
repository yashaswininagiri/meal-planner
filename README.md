# Meal Planner

A responsive, full-stack meal planning web application for a first-year B.Tech project. Users can register/log in, save recipes, plan meals for the current week, and manage a grocery checklist.

## Problem and objectives

Planning meals across a busy week can be difficult. Meal Planner keeps recipes, a weekly schedule, and shopping items in one place.

### Features
- Supabase Auth email/password registration and login
- Personal recipe collection: create, view, edit, delete, and search recipes
- Weekly Monday-to-Sunday planner with breakfast, lunch, dinner, and snack slots
- Grocery checklist with quantities, check-off, delete, and remove-checked actions
- Add a recipe's ingredients to the grocery list
- Responsive HTML/CSS interface and Express REST API

## Technology stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database and identity: Supabase PostgreSQL and Supabase Auth
- Security helpers: Helmet, Express Rate Limit, server-side Supabase client
- Version control: Git and GitHub

## Folder structure

```text
meal-planner/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── plans.js
│   │   └── groceries.js
│   ├── middleware/
│   │   └── auth.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## Prerequisites

Install:
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js LTS (includes npm)](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- A free [Supabase](https://supabase.com/) account

Verify installation in a new VS Code terminal:
```bash
node --version
npm --version
git --version
```
Each command should print a version number.

## Setup from an empty folder

### 1. Open the project
Extract the ZIP or create the folder structure above. Open the root `meal-planner` folder in VS Code.

### 2. Create a Supabase project
1. Sign in at https://supabase.com/ and create a new project.
2. Save the database password somewhere private.
3. In the project dashboard, open **Project Settings → API** (the label may vary by dashboard version).
4. Copy the Project URL, publishable/anon key, and service-role/secret key. The service-role key is privileged: never place it in frontend files or commit it to GitHub.

### 3. Create the database tables
1. Open **SQL Editor** in your Supabase dashboard.
2. Open `database/schema.sql` in VS Code and copy all its SQL.
3. Paste it into the SQL Editor and click **Run**.
4. Open **Table Editor** and verify that `recipes`, `meal_plans`, and `grocery_items` exist.
5. In **Authentication → Providers**, make sure Email authentication is enabled. For a simple local demo, you may disable email confirmation in Auth settings; if confirmation remains enabled, new users must confirm their email before logging in.

### 4. Configure environment variables
In VS Code, open a terminal in the `backend` directory and run:
```bash
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`.

Edit `backend/.env` and replace the placeholder values:
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_REAL_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_REAL_SERVER_SECRET_KEY
```
- `SUPABASE_URL`: URL of your Supabase project.
- `SUPABASE_ANON_KEY`: public/publishable key used for Supabase Auth requests.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged server-only key used for database operations after the backend verifies identity and checks ownership.
- `PORT`: local web server port.
- `NODE_ENV`: development mode for local work.

Never commit `.env`. The `.env.example` file contains placeholders only and is safe to commit.

### 5. Install packages
Make sure the terminal's current directory is `meal-planner/backend`, then run:
```bash
npm install
```
npm downloads the required packages into `node_modules/`. Do not upload `node_modules` to GitHub.

### 6. Start the application
From `backend/`, run:
```bash
npm start
```
Expected terminal output:
```text
Meal Planner running at http://localhost:3000
```
Open http://localhost:3000 in your browser. Keep the terminal running while you use the application. To stop the server, press `Ctrl+C`.

For development with automatic restart, use `npm run dev`.

## How the application works

1. The browser sends sign-up/login requests to Express.
2. Supabase Auth verifies the credentials and returns a session token.
3. The browser sends that token as `Authorization: Bearer ...` on protected API requests.
4. Express verifies the token with Supabase Auth, then filters database operations by the verified user's ID.
5. Supabase PostgreSQL stores the recipes, meal plans, and grocery items. Row Level Security is enabled, and there are no direct public table policies.

The service-role key bypasses RLS, so the backend's authentication and ownership filters are essential. Never expose the service-role key or remove the ownership checks.

## REST API reference

Protected endpoints require `Authorization: Bearer <access_token>` except sign-up, login, and health check.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/auth/signup` | Create account; body: `{ "email": "...", "password": "..." }` |
| POST | `/api/auth/login` | Log in; same body |
| GET | `/api/me` | Verify session and return current user |
| GET | `/api/recipes` | List current user's recipes |
| POST | `/api/recipes` | Create recipe: `name`, `category`, `prep_minutes`, `ingredients`, optional `instructions` |
| PUT | `/api/recipes/:id` | Update an owned recipe |
| DELETE | `/api/recipes/:id` | Delete an owned recipe and linked meal-plan entries |
| GET | `/api/plans` | List the current user's meal plan |
| POST | `/api/plans` | Add/update a meal: `plan_date` (`YYYY-MM-DD`), `meal_type`, `recipe_id`; use `recipe_id: null` to clear a slot |
| DELETE | `/api/plans?week=YYYY-MM-DD` | Clear a seven-day period starting on the supplied date |
| GET | `/api/groceries` | List current user's grocery items |
| POST | `/api/groceries` | Add item: `name`, optional `quantity` |
| PATCH | `/api/groceries/:id` | Update `is_checked` boolean |
| DELETE | `/api/groceries/:id` | Delete an owned item |
| DELETE | `/api/groceries/checked` | Remove all checked items |

### Validation and permissions
- Sign-up validates email format and password length.
- Recipe category, name, preparation time, and ingredient lengths are validated by the API and database.
- Meal-plan entries can only use recipes owned by the same user.
- Every data query filters by the verified user's ID; users cannot select another user's records by changing an ID.
- Authentication routes have rate limiting; Helmet sets security headers.
- API errors are returned as JSON without exposing stack traces.

## Manual testing checklist

1. Visit `/api/health`; expect `{"status":"ok"}`.
2. Create an account and log in.
3. Add a recipe with ingredients; expect it to appear in Recipes.
4. Edit the recipe; expect the changes to persist after refreshing.
5. Search for the recipe by name or category.
6. Choose the recipe in a weekly meal slot; refresh and verify it remains selected.
7. Add grocery items and quantities, check an item, then remove checked items.
8. Use the recipe's **Ingredients** button; ingredient lines should appear in Grocery list.
9. Try an empty recipe form or invalid prep time; the form/API should reject invalid values.
10. Delete a recipe; it should disappear and its meal-plan entries should be removed.
11. Create a second account; it should not see the first account's recipes, meals, or grocery items.
12. Log out, then attempt a protected API request; expect HTTP 401.
13. Resize the browser to mobile width; cards and navigation should remain usable.

## Troubleshooting

- **“Supabase environment variables are missing”**: check that `.env` is inside `backend/`, and that the variable names match `.env.example`.
- **Invalid API key / Auth error**: copy the correct project URL and publishable/anon key from the same Supabase project.
- **Database relation does not exist**: run the complete `database/schema.sql` in the correct project's SQL Editor.
- **New account cannot log in**: if email confirmation is enabled, open the confirmation email first. For a college demo, you can turn confirmation off in Supabase Auth settings.
- **Port already in use**: set `PORT=3001` in `backend/.env`, restart, and open `http://localhost:3001`.
- **Recipe list fails**: check that tables exist and the service-role key is correct. Never paste the key into the browser.
- **Changes do not appear**: check the terminal for server errors and the browser developer console for failed API requests.
- **`npm` is not recognized**: install Node.js LTS, close and reopen the terminal, then check `node --version` and `npm --version`.

## Git and GitHub upload

1. Create an empty repository on https://github.com/ (do not initialize it with a README if your local project already has one).
2. Open a terminal at the root `meal-planner` directory.
3. Check `.gitignore` includes `.env` and `node_modules/`.
4. Run:
```bash
git init
git status
git add .
git status
git commit -m "Build Meal Planner"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository URL shown by GitHub. In the second `git status`, verify that `.env` and `node_modules/` are not staged. Confirm the files appear on GitHub after pushing.

**Important:** `.gitignore` does not remove secrets that were already committed. If a secret is exposed, rotate/revoke it in Supabase immediately and clean the repository history as needed.

## Limitations and future improvements
- The application currently plans the current week only; the API can store other dates, but the interface shows the current Monday–Sunday week.
- Grocery items are entered manually or copied from recipe ingredient lines; ingredient quantities are not automatically combined.
- This is a learning project, not a nutrition or medical advice tool.
- Possible extensions: nutrition information, recipe photos, printable grocery lists, and planning future weeks.

## Final verification
- Frontend files are served from `frontend/`.
- Express routes match the frontend API calls.
- SQL tables and columns match the backend queries.
- Supabase secrets are kept in `backend/.env`, excluded from Git.
- User identity is verified before private data operations.
