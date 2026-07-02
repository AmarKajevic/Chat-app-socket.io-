Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack. The system supports real-time messaging, friend connections, notifications, and presence tracking using WebSockets and Redis.

This project focuses on building a scalable architecture for real-time communication with authentication, efficient state management, and containerized services.

⚙️ Tech Stack

Frontend

React (TypeScript)
Socket.io-client
Context API / State management

Backend

Node.js
Express.js
MongoDB (Mongoose)
Socket.io
Redis
JSON Web Tokens (JWT)

DevOps

Docker (MongoDB, Redis, Backend services)

 Features
 Authentication

Secure user registration and login
JWT-based authentication (stored in HTTP-only cookies)

Protected API routes

💬 Real-Time Messaging
Instant messaging using Socket.io
Typing indicators
Read receipts
Unread message counters

Friend System

Send and manage friend requests
Real-time friend request updates
Online / offline presence tracking

Notifications

Real-time notifications for:
Friend requests
Messages
User status changes

Performance & Scalability
Redis used for caching and online user tracking
Optimized socket event handling for real-time updates

DevOps
Dockerized environment for easy setup
Separate services for MongoDB and Redis
