#  FinTrack — Personal Finance Tracker

A full-stack MERN finance tracker with Dashboard, Expenses, Split, Lend/Borrow, Goals & Analytics.

---

##  Tech Stack
- **Frontend**: React.js, React Router, Recharts, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs

---

##  Project Structure
```
fintrack/
├── backend/
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Express server
│   └── .env            # Environment variables
└── frontend/
    └── src/
        ├── pages/      # Dashboard, Expenses, Split, LendBorrow, Goals, Analytics
        ├── components/ # Layout (Sidebar)
        ├── context/    # AuthContext
        └── utils/      # API helper
```

---

##  Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB running locally OR MongoDB Atlas account

### 1. Setup Backend
```bash
cd backend
npm install
```

Edit `.env` if using MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fintrack
JWT_SECRET=fintrack_super_secret_key_2024
PORT=5000
```

Start backend:
```bash
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```

App will open at **http://localhost:3000**

---

##  Features
| Feature | Description |
|---|---|
|  Auth | Register/Login with JWT |
|  Dashboard | Balance overview, pie chart, recent transactions |
|  Expenses | Add/delete income & expenses with categories |
|  Split | Split bills among multiple people, mark paid |
|  Lend/Borrow | Track money lent or borrowed, settle records |
|  Goals | Set savings goals, add money, track progress |
|  Analytics | Monthly bar chart, category pie, savings trend |

---

##  API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Add expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/splits | Get all splits |
| POST | /api/splits | Create split |
| PUT | /api/splits/:id/member/:mid | Toggle member paid |
| GET | /api/lendborrow | Get all records |
| POST | /api/lendborrow | Add record |
| PUT | /api/lendborrow/:id/settle | Settle record |
| GET | /api/goals | Get all goals |
| POST | /api/goals | Add goal |
| PUT | /api/goals/:id | Update goal |

---

Made with ❤️ for FinTrack Minor Project
