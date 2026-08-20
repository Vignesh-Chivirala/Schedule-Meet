# Schedule - Task Tracker and Analytics Application

A full-stack task management web application built using React (Vite), Node.js, Express, and MongoDB. The application allows users to register, manage their daily tasks, filter/search tasks, and view analytics on their task completion progress.

---

## Features

- User Registration and Login with JWT authentication.
- Task CRUD operations (Create, Read, Update, Delete).
- Task attributes: Title, Description, Priority (High, Medium, Low), Status (Todo, In Progress, Done), and Due Date.
- Search tasks by keywords in title and description.
- Filter tasks by status and priority.
- Sort tasks by created date, due date, priority, or title.
- Pagination support for task lists.
- Analytics dashboard displaying task counts, completion percentage, and visual status breakdown.
- Dark mode toggle with persistent local storage settings.

---

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ORM
- Authentication: JSON Web Tokens (JWT) and Bcryptjs

---

## Setup steps

### Prerequisites

- Node.js installed on your machine
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/tasktracker
   JWT_SECRET=super_secret_task_tracker_jwt_key_2026
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`.

### 2. Frontend Setup

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:5173`.

---

## API endpoints

### Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Authenticate user and get JWT token |
| GET | /api/auth/me | Get current user details |

### Task Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | /api/tasks | Fetch paginated tasks with search, filter, and sort |
| POST | /api/tasks | Create a new task |
| GET | /api/tasks/analytics | Get user task analytics statistics |
| GET | /api/tasks/:id | Get task by ID |
| PUT | /api/tasks/:id | Update task details or status |
| DELETE | /api/tasks/:id | Delete a task |

---

## Design decisions

1. Server-Side Analytics: Analytics are computed on the database using a MongoDB aggregation pipeline rather than loading all records into the browser, reducing memory and network overhead.
2. Query Indexing: Added compound indexes on user, status, priority, and due dates, along with text indexing for fast keyword searches.
3. Authentication Flow: Axios interceptors automatically attach the JWT token to outgoing requests and handle 401 unauthorized errors by clearing session state.

---

## Live link (if deployed)

- Local Application URL: `http://localhost:5173`
- Google Submission Form: [Google Assignment Submission Form](https://docs.google.com/forms/d/e/1FAIpQLSdc5wHM4EaV6bAqjnLqGBMT1-BxibEcuYyjqM8UkDdUDK4Hkw/viewform)
