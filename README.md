# 💬 Chatty — Real-Time Communication Platform

<p align="center">
  <strong>A real-time chat platform built with React, Node.js, Socket.IO, Redis and Google AI.</strong>
</p>

<p align="center">
  Users can connect through unique Connect Codes, chat in real time, track online presence, receive notifications and interact with an AI assistant.
</p>

<p align="center">

[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black?style=for-the-badge\&logo=socket.io)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-Session%20%26%20Presence-DC382D?style=for-the-badge\&logo=redis)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge\&logo=docker)](https://www.docker.com/)

</p>

---

## 📸 Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Real-Time Chat

![Chat](./screenshots/chat.png)

### Connect Codes

![Connect Codes](./screenshots/connect-code.png)

### AI Assistant

![AI Assistant](./screenshots/ai-chat.png)

---

## ✨ Features

* 🔐 **JWT Authentication** — Secure authentication using HTTP-only cookies
* ⚡ **Real-Time Messaging** — Instant communication powered by Socket.IO
* 🔑 **Connect Codes** — Connect with other users using unique codes
* 👥 **Friend System** — Send, accept and manage friend requests
* 🟢 **Online Presence** — Real-time online/offline status
* 🔔 **Real-Time Notifications** — Instant notifications for user activity
* ✓ **Read Receipts** — Track message status
* ⌨️ **Typing Indicators** — See when another user is typing
* 🤖 **AI Assistant** — Integrated Google AI conversational assistant
* 🔴 **Redis Sessions** — Track multiple active Socket.IO sessions per user
* 🐳 **Docker** — Containerized development and deployment environment

---

## 🏗️ Architecture

```text
                    ┌────────────────────┐
                    │   React + TS       │
                    │     Frontend       │
                    └─────────┬──────────┘
                              │
                       REST / WebSocket
                              │
                              ▼
                    ┌────────────────────┐
                    │  Node.js / Express │
                    │      Backend       │
                    └──────┬─────┬───────┘
                           │     │
                ┌──────────┘     └──────────┐
                ▼                           ▼
          ┌──────────┐                ┌──────────┐
          │ MongoDB  │                │  Redis   │
          │  Data    │                │ Sessions │
          └──────────┘                │ Presence │
                                      └──────────┘
                                          
                              │
                              ▼
                       ┌─────────────┐
                       │  Google AI  │
                       │ AI Assistant│
                       └─────────────┘
```

### Redis Presence

Redis stores active Socket.IO sessions using:

```text
user:{userId}:sessions
```

Each user can have multiple active sessions. The application uses Redis Sets to track socket IDs and determine whether a user is currently online.

---

## 🛠️ Tech Stack

**Frontend**

* React
* TypeScript
* Socket.IO Client

**Backend**

* Node.js
* Express
* Socket.IO
* JWT

**Database & Infrastructure**

* MongoDB
* Redis
* Docker

**AI**

* Google AI

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/AmarKajevic/Chat-app-socket.io-.git

cd Chat-app-socket.io-
```

### 2. Environment Variables

Create a `.env` file:

```env
PORT=
CLIENT_ORIGIN=
MONGO_URI=
JWT_SECRET=
REDIS_URI=
GOOGLE_API_KEY=
```

### 3. Run with Docker

```bash
docker compose up --build
```

Or run the frontend and backend separately using the project's package scripts.

---

## 🔮 Future Improvements

* Horizontal Socket.IO scaling with Redis Adapter
* Message pagination
* File and image sharing
* Push notifications
* AI conversation memory
* Automated testing
* Production monitoring

---

## 👨‍💻 Author

**Amar Kajevic**

Full-Stack Developer focused on React, Next.js, Node.js, TypeScript, real-time applications and distributed systems.

### Featured Projects

**[Vendora](https://github.com/AmarKajevic/Vendora-Multi-vendor-ecommerce-platform)**
Multi-vendor e-commerce platform with Kafka, Redis, Stripe, TensorFlow, Docker and CI/CD.

**[Chatty](https://github.com/AmarKajevic/Chat-app-socket.io-)**
Real-time communication platform with Socket.IO, Redis and AI.
