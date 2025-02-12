# Pulikids eLearning Management System

This repository contains the full-stack implementation of the Pulikids eLearning Management System. The project consists of a **React** frontend and a **Django Rest Framework (DRF)** backend.

## Table of Contents
- [Project Overview](#project-overview)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Postman Collection](#postman-collection)

## Project Overview
The Pulikids eLearning Management System is a childcare and education management system that serves nurseries, schools, and childcare providers. The application includes features such as:
- User authentication (Students & Teachers)
- Course management
- Real-time communication via WebSockets
- Notifications
- File uploads

## Folder Structure
```
project-root/
│── backend/              # Django backend
│   ├── manage.py         # Django management script
│   ├── requirements.txt  # Backend dependencies
│   ├── .env              # Environment variables
│   ├── apps/             # Contains all Django apps
│   │   ├── <app_name>/   # Example app
│   │   │   ├── admin.py  # Django admin configuration
│   │   │   ├── apps.py   # App configuration
│   │   │   ├── models.py # Database models
│   │   │   ├── serializers.py # DRF serializers
│   │   │   ├── filters.py # Django filters
│   │   │   ├── views.py  # API views
│   │   │   ├── urls.py   # URL routing
│   ├── ...               # Other backend files
│── frontend/             # React frontend (built with Vite)
│   ├── package.json      # Frontend dependencies
│   ├── .env              # Environment variables
│   ├── ...               # Other frontend files
```

## Setup Instructions

### Prerequisites
Ensure you have the following installed before proceeding:
- **Python 3.12 or above**
- **Redis**
- **Node.js**

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # (Windows: venv\Scripts\activate)
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```sh
   python manage.py migrate
   ```
5. Create a superuser:
   ```sh
   python manage.py createsuperuser
   ```
6. Start the backend server:
   ```sh
   python manage.py runserver
   ```
7. Run Celery:
   ```sh
   celery -A backend worker -l info -P solo
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```

## Environment Variables
Create a `.env` file in both the `backend/` and `frontend/` directories with the following variables:

### Backend (`backend/.env.example`)
```
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=*
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=authapi@noreplay.com
SITE_URL=http://127.0.0.1:8000
```
> **Note**: Do not push `.env` files with sensitive credentials to the repository. Instead, provide a `.env.example` file with placeholder values.

### Frontend (`frontend/.env.example`)
```
VITE_API_BASE_URL=http://localhost:8000
```

## API Documentation
The API documentation is available in the published Postman collection:
[Postman Documentation](https://documenter.getpostman.com/view/34977433/2sAYXBHLLU)

## Features
- **User Authentication**: Students and teachers can sign up and log in.
- **Course Management**: Teachers can create courses, and students can enroll.
- **Real-time Chat**: WebSocket-based chat feature for real-time messaging.
- **File Uploads**: Teachers can upload course materials.
- **Notifications**: Students get notified about new courses and materials.

## Testing
To run tests for the backend:
```sh
python manage.py test
```

## Deployment
The project is deployed at:
**Frontend**: [https://e-learning-frontend-theta-coral.vercel.app/](https://e-learning-frontend-theta-coral.vercel.app/)

Deployment can be done using services like **PythonAnywhere, Railway, DigitalOcean, or AWS**.

## Postman Collection
The Postman collection with all API endpoints is available at:
[Postman Documentation](https://documenter.getpostman.com/view/34977433/2sAYXBHLLU)

---
**GitHub Submission**: Ensure that the `.env.example` files, all documents, and links are included in your GitHub repository before submission.

