# Attendance Management System

A Django-based **Attendance Management System** for managing employees, departments, attendance records, check-in/check-out times, and related workforce information.

The project is being developed using **Django and Django REST Framework**, with PostgreSQL as the database.

## 🚀 Features

* Employee management
* Department management
* Employee attendance tracking
* Check-in and check-out functionality
* Attendance date tracking
* Attendance status management
* RESTful API using Django REST Framework
* Token-based API authentication
* Session authentication
* API documentation with Swagger/OpenAPI
* PostgreSQL database integration
* CORS support
* Environment variables using `.env`

## 🛠️ Tech Stack

| Technology            | Usage                 |
| --------------------- | --------------------- |
| Python                | Programming language  |
| Django                | Web framework         |
| Django REST Framework | REST API              |
| PostgreSQL            | Database              |
| DRF Spectacular       | API documentation     |
| django-cors-headers   | CORS support          |
| python-dotenv         | Environment variables |
| Git & GitHub          | Version control       |

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
├── .env
├── .gitignore
├── manage.py
├── requirements.txt
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/kaushal-karna/Attendance_System.git
cd Attendance_System
```

### 2. Create a virtual environment

Windows:

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

Linux/macOS:

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

## 🔐 Environment Variables

Create a `.env` file in the project root.

```env
SECRET_KEY=your-secret-key

DB_NAME=attendance_db
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

> **Important:** Never commit your `.env` file to GitHub.

Make sure `.env` is included in `.gitignore`:

```gitignore
.env
venv/
.venv/
__pycache__/
*.pyc
```

## 🗄️ Database Setup

Make sure PostgreSQL is installed and running.

Create the database:

```sql
CREATE DATABASE attendance_db;
```

Then run Django migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

## 👤 Create Superuser

Create an admin account:

```powershell
python manage.py createsuperuser
```

Follow the prompts to set the username, email, and password.

## ▶️ Run the Development Server

```powershell
python manage.py runserver
```

The application will be available at:

```text
http://127.0.0.1:8000/
```

## 🔑 Django Admin

Open:

```text
http://127.0.0.1:8000/admin/
```

Log in using the superuser credentials.

## 🔌 API

The project uses **Django REST Framework** to provide API endpoints for application data.

Authentication supports:

* Session Authentication
* Token Authentication

API endpoints can be accessed through the configured application routes.

## 📚 API Documentation

The project uses **drf-spectacular** for OpenAPI documentation.

Swagger UI:

```text
/api/schema/swagger-ui/
```

OpenAPI schema:

```text
/api/schema/
```

## 🔄 Git Workflow

After making changes:

```powershell
git add .
git commit -m "your commit message"
git push
```

Example:

```powershell
git add .
git commit -m "feat: add employee attendance tracking"
git push
```

## 📌 Project Status

🚧 **Currently in development**

New attendance, employee, department, authentication, and API features are being added progressively.

## 🎯 Future Improvements

* Employee dashboard
* Attendance reports
* Monthly attendance summaries
* Late check-in detection
* Early check-out detection
* Leave management
* Attendance filtering
* Export attendance reports
* Role-based permissions
* Improved API endpoints
* Dashboard analytics
* Automated attendance calculations

## 👨‍💻 Author

**Kaushal Karn**

BSc. CSIT Student | Backend Developer

GitHub: https://github.com/kaushal-karna

LinkedIn: https://www.linkedin.com/in/kaushal-karn/

## 📄 License

This project is currently intended for learning and development purposes.
