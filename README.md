# Rise - IT Learning Platform

Rise is a modern IT learning platform designed for structured courses, interactive exercises, and skills assessments.

## Tech Stack
- **Frontend**: React (Vite), Axios, React Router DOM
- **Backend**: Node.js, Express, MySQL2 (Promise Pool), JWT, Nodemailer, Google OAuth (Passwordless Email OTP)
- **Database**: MySQL 8.0+

## Project Structure
```text
Rise/
├── client/          # Frontend React application (Vite)
│   ├── src/
│   │   ├── api.js   # Axios client instance
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── .env
├── server/          # Backend Express API
│   ├── config/      # Database & app configuration
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Auth & validation middleware
│   ├── routes/      # Express route definitions
│   ├── index.js     # Server entry point
│   ├── db.js        # DB connection re-export
│   ├── .env
│   └── .env.example
├── .gitignore
└── README.md
```

## Setup & Running Locally

### 1. Database Setup
Log in to MySQL (via MySQL Command Line Client or Workbench):
```sql
CREATE DATABASE IF NOT EXISTS rise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'rise_user'@'localhost' IDENTIFIED BY 'rise_secure_pass123';
GRANT ALL PRIVILEGES ON rise_db.* TO 'rise_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Server
Navigate to `/server` and start development mode:
```powershell
cd server
npm run dev
```
Health endpoint: `http://localhost:5000/api/health`

### 3. Frontend Client
Navigate to `/client` and start the Vite dev server:
```powershell
cd client
npm run dev
```
Client URL: `http://localhost:5173`
