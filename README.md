#  Schedule Meet – Cal.com Clone

A full-stack scheduling and booking web application inspired by Cal.com.
Users can create event types, define availability, and allow others to book time slots via a public page.


##  Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* PostgreSQL (Supabase)

### Deployment

* Vercel (Frontend)
* Render (Backend)
* Supabase (Database)

---

##  Features

### 🔹 Event Management

* Create, update, delete event types
* Custom duration, slug-based URLs
* Buffer time and custom questions

### 🔹 Availability

* Weekly availability (Mon–Sun)
* Time ranges per day
* Timezone support
* Override specific dates

### 🔹 Booking System

* Public booking page
* Dynamic time slot generation
* Prevent double booking
* Buffer time handling

### 🔹 Dashboard

* View all event types
* Upcoming & past bookings
* Cancel / reschedule bookings

---

## 📁 Project Structure

```
Schedule/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Vignesh-Chivirala/Schedule.git
cd Schedule
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL=your_supabase_connection_string
PORT=5000
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=https://schedule-meet-ib1r.onrender.com/api
```

Run frontend:

```bash
npm run dev
```

---

## 🗄 Database Schema (PostgreSQL)

### events

* id
* title
* description
* duration
* slug

### availability

* event_id
* day_of_week
* start_time
* end_time

### bookings

* event_id
* name
* email
* date
* time

---

## 🔗 API Endpoints

### Events

* GET `/api/events`
* GET `/api/events/:slug`
* POST `/api/events`

### Bookings

* GET `/api/bookings`
* POST `/api/bookings`
* PUT `/api/bookings/:id`
* DELETE `/api/bookings/:id`

### Availability

* GET `/api/availability/:event_id`
* POST `/api/availability`
* GET `/api/availability/slots`

---

##  Known Issues

* Render free tier causes cold starts (delay on first request)
* Ensure `vercel.json` is configured for routing
* Use React Router `<Link>` instead of `<a>` to avoid 404

---

##  Future Improvements

*  Interactive calendar UI
*  Email notifications
*  Rescheduling flow
*  Multi-timezone support
*  UI polish (closer to Cal.com)


