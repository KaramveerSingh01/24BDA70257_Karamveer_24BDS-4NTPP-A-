# SkillPath AI

SkillPath AI is a simple online learning and skill development platform. A learner chooses a skill, their current level, available time, and learning goal. The app creates a personalized day-by-day study plan, links each day to relevant YouTube search results, and tracks completed days.

## Features

- Register and log in with a MongoDB account; passwords are hashed with bcrypt.
- Create learning plans with Gemini, or use the built-in demo plan if Gemini is not configured or unavailable.
- View objectives, practice tasks, estimated hours, and YouTube learning searches for each day.
- Mark days complete and track plan and dashboard progress.
- Browse a static catalog of suggested skills.

## Technology

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js and Express
- Database: MongoDB and Mongoose
- AI: Google Gemini API (`@google/generative-ai`)
- Authentication: Express session and bcrypt

## Project structure

```text
skillpath-ai/
├── server.js
├── package.json
├── .env.example
├── models/                 # MongoDB schemas
├── routes/                 # Authentication and study-plan APIs
├── utils/                  # Separate demo fallback plan generator
└── public/
    ├── *.html              # Home, account, dashboard, plan, courses, profile
    ├── css/style.css
    └── js/                  # Navigation and page interactions
```

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB connection URI
- A Gemini API key is optional; without it the app uses its demo fallback plans

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set `MONGODB_URI`. Add a `GEMINI_API_KEY` to enable AI generation. Set a private `SESSION_SECRET` for your local session cookie.

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/skillpath-ai
   GEMINI_API_KEY=
   SESSION_SECRET=replace-this-with-a-long-random-value
   PORT=3000
   ```

3. Start MongoDB, then run the app:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Pages are served even when MongoDB is unavailable. Accounts and saved study plans require MongoDB. If Gemini is missing or fails, the plan generator uses the separate demo fallback data for Python, SQL, Data Analytics, and Web Development; other skills get a simple generated demo outline.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/study-plans/generate`
- `GET /api/study-plans`
- `GET /api/study-plans/:id`
- `PATCH /api/study-plans/:id/day/:dayNumber`

Study-plan routes require a logged-in session. API errors return friendly messages instead of exposing server details.