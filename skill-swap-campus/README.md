# 🔄 Skill Swap Campus

A full-stack platform for students to exchange skills and knowledge with each other — no money, just learning.

## Tech Stack

- **Frontend**: React + Vite + JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io (chat + notifications)
- **Auth**: JWT

---

## Features

- 🔐 User registration & login (JWT auth)
- 👤 Rich user profiles with skills to teach & learn
- 🤝 Smart skill-based matching algorithm
- 🔍 Search & browse students by skill or category
- 📅 Session booking & scheduling system
- 💬 Real-time chat with typing indicators
- ⭐ Ratings & reviews after sessions
- 🔔 In-app notifications (Socket.io)
- 🏅 Badges & achievements system
- 💎 Credits system (earn by teaching, spend to learn)
- 🛡️ Admin panel for user management

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone / open the project

```bash
cd skill-swap-campus
```

---

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev    # development (nodemon)
# or
npm start      # production
```

The API will run on **http://localhost:5000**

---

### 3. Set up the Frontend

```bash
cd ../client
npm install
npm run dev
```

The app will run on **http://localhost:5173**

---

### 4. Open the app

Go to [http://localhost:5173](http://localhost:5173) in your browser.

Register an account, add your skills, and start swapping!

---

## Project Structure

```
skill-swap-campus/
├── server/
│   ├── models/          # Mongoose schemas (User, Session, Message, Review, Notification)
│   ├── routes/          # Express API routes
│   ├── middleware/       # JWT auth middleware
│   └── server.js        # Entry point + Socket.io
│
└── client/
    └── src/
        ├── pages/        # Landing, Login, Register, Dashboard, Browse, Schedule, Messages, Profile, ...
        ├── components/
        │   ├── layout/   # Sidebar, Layout
        │   └── ui/       # Modals (Session Request, Review)
        ├── context/      # AuthContext (global user state)
        └── utils/        # axios instance, helpers
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/users | Browse/search users |
| GET | /api/users/:id | Get user profile + reviews |
| PUT | /api/users/profile | Update profile |
| GET | /api/sessions | Get my sessions |
| POST | /api/sessions | Request a session |
| PUT | /api/sessions/:id/respond | Accept/decline session |
| PUT | /api/sessions/:id/complete | Mark session complete |
| GET | /api/matches | Get skill swap matches |
| GET | /api/messages/conversations | Get all conversations |
| GET | /api/messages/:userId | Get messages with user |
| POST | /api/messages | Send a message |
| POST | /api/reviews | Submit a review |
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read-all | Mark all read |

---

## Deployment (Optional)

- **Frontend**: Deploy to [Vercel](https://vercel.com) — just connect the `/client` folder
- **Backend**: Deploy to [Render](https://render.com) — connect `/server`, add env vars
- **Database**: Use [MongoDB Atlas](https://cloud.mongodb.com) for a free cloud DB

---

Built with ❤️ for students everywhere.
