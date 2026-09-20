# Smart Civic Issue Monitoring & Grievance Resolution System 🏛️🚀

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, enterprise-grade civic grievance management and municipal monitoring platform built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) with **Leaflet GIS Spatial Mapping**, **Cloudinary Multimedia Storage**, and **Automated Department Routing**.

---

## 🌟 Key Highlights & Capabilities

### 👥 1. Citizen Experience
- **Smart Grievance Submission**: Report civic issues (potholes, garbage, water leaks, streetlights, drainage) with photo/video proof, automatic geolocation detection, and reverse geocoding.
- **Direct Live Tracking**: Real-time ticket status tracking using unique Complaint Reference IDs (`CMP-XXXXXX`).
- **Cryptographic Audit Stepper**: Visual stage-by-stage journey timeline from ticket registration to nodal officer dispatch and closure.
- **Citizen Feedback & Reopen Loop**: Rate resolution satisfaction (1–5 stars), provide closure remarks, or dispute/reopen grievances with fresh photo evidence if remediation is inadequate.
- **Before / After Transparency Gallery**: Public audit gallery comparing pre-repair and post-resolution evidence.

### 🏢 2. Municipal Administration & Governance
- **Interactive GIS Incident Map**: Live geospatial map visualization powered by Leaflet with marker clustering, category color-coding, and location filtering across municipal zones.
- **Automated Department Dispatch**: AI-assisted rule-based routing to allocate complaints to appropriate civic divisions (Public Works, Health & Sanitation, Water Supply, Electricity, etc.).
- **Live Analytics & SLA Compliance**: Interactive dashboards visualizing ticket volumes, department resolution rates, and SLA breach monitors.
- **Inter-Department Transfers**: Transfer complaints seamlessly between municipal authorities with audit trail preservation.
- **Multi-Tier Role Management**: Secure access controls for Citizens, Departmental Nodal Officers, City Admins, and Super Administrators.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, Modern Glassmorphism UI
- **Icons**: Lucide React
- **GIS & Mapping**: Leaflet, React-Leaflet, OpenStreetMap
- **State & HTTP**: Axios, React Router v6, React-Toastify

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB with Mongoose (with automated fallback to MongoMemoryServer for isolated local testing)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only Cookies & Bcrypt
- **Cloud Evidence Storage**: Cloudinary SDK (supports high-res photo and video evidence up to 500MB)
- **Notification Engine**: Nodemailer (automated dispatch and resolution email notifications)

---

## 📁 Repository Structure

```
Smart-Civic-Issue-Monitoring-System/
├── client/                     # React + Vite Frontend Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images and design assets
│   │   ├── components/         # UI, GIS, Modal, and Admin components
│   │   │   ├── admin/          # Dashboard cards, tables, analytics, timeline
│   │   │   ├── ai/             # AI command center & predictive cards
│   │   │   ├── engagement/     # Before-After gallery & civic feedback
│   │   │   ├── gis/            # Municipal GIS interactive map
│   │   │   └── UI/             # Reusable UI primitives (buttons, modals, badges)
│   │   ├── context/            # Global React Context providers
│   │   ├── data/               # Regional location & department hierarchy data
│   │   ├── pages/              # Citizen & Admin portal route pages
│   │   ├── utils/              # Client-side helper functions
│   │   ├── App.jsx             # Main routing & application layout
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML5 application template
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Client dependencies & build scripts
│
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # Database (Mongoose) & Cloudinary configuration
│   ├── controllers/            # Controller business logic (Complaints, Admin, GIS, etc.)
│   ├── middleware/             # JWT Authentication & error handling middleware
│   ├── models/                 # Mongoose schemas (Complaint, Department, User, etc.)
│   ├── routes/                 # Express API endpoint route definitions
│   ├── utils/                  # Geocoding, AI routing, and notification helpers
│   ├── .env.example            # Environment variables template
│   ├── server.js               # Express application entrypoint
│   └── package.json            # Server dependencies & scripts
│
├── docs/                       # Project documentation & maintenance guidelines
├── .gitignore                  # Root gitignore (ignores node_modules, .env, dist, etc.)
├── README.md                   # Project overview & documentation
└── SECURITY.md                 # Security guidelines & vulnerability reporting
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a MongoDB Atlas URI)
- Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/Advitnayak4311/Smart-Civic-Issue-Monitoring-System.git
cd Smart-Civic-Issue-Monitoring-System
```

---

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Configure your `.env` values:
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_civic_db
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
# Development mode (with nodemon)
npm run server

# Or standard start
npm start
```
The server will run on `http://localhost:8000`.

---

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The client will launch at `http://localhost:5173`.

---

### 4. Production Build
To create an optimized production build of the frontend:
```bash
cd client
npm run build
```

---

## 🔒 Security & Privacy

- All sensitive keys (`.env`) are excluded from version control via `.gitignore`.
- Password hashing using `bcryptjs`.
- Secure authorization using JWT stored in HTTP-only cookies.
- See [SECURITY.md](SECURITY.md) for full security disclosures and vulnerability reporting policies.

---

## 👨‍💻 Author & Ownership

- **Author**: Advit Umesh Nayak
- **GitHub**: [@Advitnayak4311](https://github.com/Advitnayak4311)
- **Repository**: [Smart-Civic-Issue-Monitoring-System](https://github.com/Advitnayak4311/Smart-Civic-Issue-Monitoring-System)
- **License**: ISC
