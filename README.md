# 💬 Chatty — Real-Time Communication Platform

<p align="center">
  <strong>Real-time communication platform built with React, Node.js, Socket.IO, Redis and Google AI.</strong>
</p>

<p align="center">
  Connect with users through unique Connect Codes, chat in real time, track online presence, receive instant notifications and interact with an AI assistant.
</p>

<p align="center">
  <a href="https://chatty-ai-app.onrender.com/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Chatty-success?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/AmarKajevic/Chat-app-socket.io-">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

---

## 📸 Screenshots

### Dashboard

![Chatty Dashboard](./screenshots/dashboard.png)

### Real-Time Chat

![Real-Time Chat](./screenshots/chat.png)

### Connect Codes

![Connect Codes](./screenshots/connect-code.png)

### AI Assistant

![AI Assistant](./screenshots/ai-chat.png)

---

## ✨ Features

* ⚡ **Real-Time Messaging** — Instant communication powered by Socket.IO
* 🔐 **JWT Authentication** — Secure authentication with HTTP-only cookies
* 🔑 **Connect Codes** — Connect with users using unique codes
* 👥 **Friend System** — Send, accept and manage friend requests
* 🟢 **Online Presence** — Real-time online/offline status
* 🔔 **Real-Time Notifications** — Instant user activity notifications
* ✓ **Read Receipts** — Track message status
* ⌨️ **Typing Indicators** — Real-time typing status
* 🤖 **AI Assistant** — Integrated Google AI conversational assistant
* 🔴 **Redis Sessions** — Track multiple active Socket.IO sessions per user
* 🐳 **Docker** — Containerized application environment

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │   React + TypeScript  │
                    │       Frontend       │
                    └──────────┬───────────┘
                               │
                      REST / WebSocket
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express   │
                    │       Backend        │
                    └──────┬────────┬──────┘
                           │        │
                    REST   │        │ Socket.IO
                           │        │
                           ▼        ▼
                    ┌──────────┐ ┌──────────┐
                    │ MongoDB  │ │  Redis   │
                    │          │ │ Sessions │
                    │  Data    │ │ Presence │
                    └──────────┘ └──────────┘
                                     
                           │
                           ▼
                    ┌──────────────┐
                    │  Google AI   │
                    │ AI Assistant │
                    └──────────────┘
```

### Redis Presence

Redis is used to manage active Socket.IO sessions.

Sessions are stored using:

```text
user:{userId}:sessions
```

Each user can have multiple active sessions. Redis Sets track the connected socket IDs, allowing the application to determine whether a user is currently online.

This approach supports multiple browser tabs or devices without relying on a simple `online: true/false` flag.

---

## 🛠️ Tech Stack

| Area                | Technologies                        |
| ------------------- | ----------------------------------- |
| **Frontend**        | React, TypeScript, Socket.IO Client |
| **Backend**         | Node.js, Express, Socket.IO         |
| **Authentication**  | JWT, HTTP-only Cookies              |
| **Database**        | MongoDB, Mongoose                   |
| **Real-Time State** | Redis                               |
| **AI**              | Google AI                           |
| **Infrastructure**  | Docker, Docker Compose              |

---

## 🚀 Live Demo

**Try Chatty:**
https://chatty-ai-app.onrender.com/

The application is deployed and available as a live production demo.

---

## ⚙️ Run Locally

### Clone

```bash
git clone https://github.com/AmarKajevic/Chat-app-socket.io-.git

cd Chat-app-socket.io-
```

### Environment Variables

Create a `.env` file with:

```env
PORT=
CLIENT_ORIGIN=
MONGO_URI=
JWT_SECRET=
REDIS_URI=
GOOGLE_API_KEY=
```

### Docker

```bash
docker compose up --build
```

---

## 📂 Project Structure

```text
Chatty/
│
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   └── utils/
│
├── frontend/
│
├── screenshots/
│
└── README.md
```

---

## 🎯 What This Project Demonstrates

Chatty was built to explore practical real-time application architecture, including:

* WebSocket communication with Socket.IO
* Distributed session and presence management with Redis
* JWT authentication and HTTP-only cookies
* Real-time notifications and messaging
* MongoDB data modeling
* AI API integration
* Dockerized development and deployment

---

## 👨‍💻 Author

**Amar Kajevic**

Full-Stack Developer focused on:

**React · Next.js · TypeScript · Node.js · Express · Real-Time Systems · Docker**

### Featured Projects

**[Vendora](https://github.com/AmarKajevic/Vendora-Multi-vendor-ecommerce-platform)**
Multi-vendor e-commerce platform featuring Kafka, Redis, Stripe, TensorFlow, Docker and CI/CD.

**[Chatty](https://github.com/AmarKajevic/Chat-app-socket.io-)**
Real-time communication platform featuring Socket.IO, Redis, JWT authentication and Google AI.
