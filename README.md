# ConvoGate

A full-stack real-time communication platform built using React, Django, Django Channels, WebSockets, JWT, and MySQL.

ConvoGate enables users to communicate through private and group conversations while providing additional collaboration features such as expense management, festival greeting sharing, file exchange, and customizable user settings.

---

## Features

### Real-Time Communication

* Real-time messaging using WebSockets
* Private chats
* Group chats
* Instant message delivery
* Read receipts and delivery status

### Chat Room Management

* Private chat rooms
* Group chat rooms
* Password-protected rooms
* Quick chat rooms with expiration support

### Advanced Messaging

* Text messaging
* Voice messages
* Reply to messages
* Emoji reactions
* Message editing
* Message status indicators
* File sharing
* Image sharing
* Downloadable attachments

### Expense Management

* Shared expense tracking
* Bill splitting among group members
* Loan tracking
* Payment confirmations
* Payment reminders

### Festival Greeting Sharing

* Predefined festival greetings
* Custom greeting messages
* Group greeting sharing

### User Management

* User registration and login
* JWT-based authentication
* User profiles
* Status messages
* Privacy settings
* Notification preferences

### Personalization

* Dark mode
* Light mode
* Customizable user preferences

---

## Technology Stack

### Frontend

* React
* Tailwind CSS
* Axios
* Vite

### Backend

* Python
* Django
* Django REST Framework
* Django Channels

### Database

* MySQL

### Authentication

* JSON Web Token (JWT)

### Real-Time Communication

* WebSockets
* Django Channels

---

## System Architecture

```text
React Frontend
       │
       ▼
REST API + WebSocket
       │
       ▼
Django Backend
       │
       ▼
MySQL Database
```

---

## Security Features

* JWT Authentication
* Secure Password Storage using PBKDF2 + SHA256
* Protected API Endpoints
* Access-Controlled Chat Rooms
* Secure Session Management

---

## Project Structure

```text
ConvoGate/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── backend/
│   ├── convo/
│   ├── media/
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
├── README.md
└── mock_data.sql
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ConvoGate.git
cd ConvoGate
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Screenshots

### Login Page

(Add Screenshot)

### Chat Dashboard

(Add Screenshot)

### Group Chat

(Add Screenshot)

### Expense Management

(Add Screenshot)

### Dark Mode

(Add Screenshot)

---

## Key Functionalities

* Real-time communication
* Group collaboration
* Expense splitting and tracking
* Festival greeting sharing
* File and media exchange
* User personalization
* Secure authentication and authorization

---

## Future Enhancements

* Video calling
* Push notifications
* End-to-end encryption
* Mobile application
* Message search optimization
* AI-powered smart message suggestions

---

## Learning Outcomes

This project helped in gaining practical experience with:

* Full Stack Development
* REST API Design
* WebSocket Communication
* Authentication & Authorization
* Database Design
* State Management
* Real-Time Systems
* Responsive UI Development

---

## Author

**Janvi Maru**
Learnig project – ConvoGate

---

## License

This project was developed for educational and internship purposes.
