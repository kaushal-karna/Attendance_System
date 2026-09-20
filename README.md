# Attendance Management System

A full-stack **Attendance Management System** for managing employees, departments, attendance records, check-in/check-out times, monthly reports, and workforce information.

The project consists of a **Django + Django REST Framework backend** and a **React + Vite frontend**, with PostgreSQL support for production database usage.

---

## 🚀 Features

### Employee Management

* Create, view, update, and delete employees
* Employee UID management
* Employee department assignment
* Employee information management

### Department Management

* Create and manage departments
* Assign employees to departments
* Department-based employee organization

### Attendance Management

* Employee check-in
* Employee check-out
* Attendance date tracking
* Check-in and check-out time tracking
* Attendance status management
* Attendance history

### Reports

* Monthly attendance reports
* Employee attendance summaries
* First check-in and last check-out information
* Attendance statistics

### Backend

* RESTful API using Django REST Framework
* Session authentication
* Swagger/OpenAPI documentation
* PostgreSQL database support
* CORS support
* Environment variable configuration

### Frontend

* React 19
* Vite development server
* Employee management interface
* Department management interface
* Attendance interface
* Dashboard
* Monthly reports
* Responsive component-based UI

---

## 🛠️ Tech Stack

| Technology            | Usage                                      |
| --------------------- | ------------------------------------------ |
| Python                | Backend programming language               |
| Django                | Backend web framework                      |
| Django REST Framework | REST API                                   |
| PostgreSQL            | Production database                        |
| SQLite                | Local development database                 |
| DRF Spectacular       | OpenAPI / Swagger documentation            |
| django-cors-headers   | Cross-Origin Resource Sharing              |
| python-dotenv         | Environment configuration                  |
| React                 | Frontend library                           |
| Vite                  | Frontend build tool and development server |
| JavaScript            | Frontend programming                       |
| Git & GitHub          | Version control                            |

---

## 📁 Project Structure

```text
Attendance_System/
│
├── attendance/
│   ├── migrations/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .env
├── .gitignore
├── manage.py
├── requirements.txt
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/kaushal-karna/Attendance_System.git
cd Attendance_System
```

---

# 🐍 Backend Setup

## 2. Create a Python virtual environment

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
SECRET_KEY=your-secret-key

DB_NAME=attendance_db
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

> **Important:** Never commit your `.env` file to GitHub.

Make sure `.env` is included in `.gitignore`.

---

# 🗄️ Database Setup

For PostgreSQL development/production usage, make sure PostgreSQL is installed and running.

Create the database:

```sql
CREATE DATABASE attendance_db;
```

Then run Django migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

For local development, the project can also use SQLite depending on the configured Django settings.

---

# 👤 Create Superuser

Create a Django admin account:

```powershell
python manage.py createsuperuser
```

Follow the prompts to configure the username, email, and password.

---

# ⚛️ Frontend Setup

The React frontend is located inside:

```text
frontend/
```

Move into the frontend directory:

```powershell
cd frontend
```

Install JavaScript dependencies:

```powershell
npm install
```

The dependencies are defined in:

```text
frontend/package.json
```

and locked through:

```text
frontend/package-lock.json
```

> `node_modules/` is intentionally not committed to GitHub.

---

# ▶️ Running the Application

The project uses two development servers.

## 1. Start Django Backend

From the project root:

```powershell
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

---

## 2. Start React Frontend

Open another terminal and navigate to:

```powershell
cd frontend
```

Start Vite:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173/
```

---

## 🔄 Application Architecture

```text
                    Attendance Management System

                              ┌──────────────┐
                              │    React     │
                              │   Frontend   │
                              │   Vite       │
                              └──────┬───────┘
                                     │
                                  REST API
                                     │
                                     ▼
                              ┌──────────────┐
                              │    Django    │
                              │     REST     │
                              │     API      │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ PostgreSQL / │
                              │    SQLite    │
                              └──────────────┘
```

The React frontend communicates with Django through REST API endpoints.

Frontend API configuration:

```text
frontend/src/services/api.js
```

---

# 🔌 API

The backend uses **Django REST Framework** to provide API endpoints for employees, departments, attendance, and reports.

Authentication currently supports:

* Session Authentication

API routes are configured through the Django application URL configuration.

---

# 📚 API Documentation

The project uses **drf-spectacular** for OpenAPI documentation.

### Swagger UI

```text
http://127.0.0.1:8000/api/schema/swagger-ui/
```

### OpenAPI Schema

```text
http://127.0.0.1:8000/api/schema/
```

---

# 🌐 CORS

Because the React development server and Django development server run on different ports, CORS is configured for frontend-to-backend API communication.

Development frontend:

```text
http://localhost:5173
```

Django backend:

```text
http://127.0.0.1:8000
```

---

# 🔄 Git Workflow

After making changes:

```powershell
git status
git add .
git commit -m "your commit message"
git push
```

Example:

```powershell
git add .
git commit -m "feat: integrate React frontend with Django backend"
git push
```

---

# 📌 Project Status

🚧 **Currently in development**

The project is being actively developed as a full-stack attendance management system.

Current development includes:

* Employee management
* Department management
* Attendance tracking
* Check-in/check-out
* Attendance reports
* Django REST API
* React frontend
* Dashboard
* Monthly attendance summaries

---

# 🎯 Future Improvements

* RFID-based attendance
* Advanced attendance analytics
* Late check-in detection
* Early check-out detection
* Leave management
* Role-based permissions <!-- * Export attendance reports -->
* PDF report generation
* Improved dashboard analytics
* Automated attendance calculations
* Production deployment
* Improved authentication and authorization

---

# 👨‍💻 Author

**Kaushal Karn**

BSc. CSIT Student | Backend Developer

GitHub:
https://github.com/kaushal-karna

LinkedIn:
https://www.linkedin.com/in/kaushal-karn/

---

# 📄 License

This project is currently intended for learning and development purposes.
