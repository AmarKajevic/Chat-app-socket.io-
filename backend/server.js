import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initializeSocket } from "./socket.js";
import { socketAuthMiddleware } from "./socket/SocketAuthMiddleware.js";
import RedisService from "./services/RedisService.js";
import path from "path";
import { fileURLToPath } from "url";

// ⭐ Dobij __dirname u ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);

// CORS – u produkciji koristi CLIENT_ORIGIN iz .env
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({
    origin: clientOrigin,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/conversations', messageRoutes);


if (process.env.NODE_ENV === "production") {
    // Putanja do frontend dist foldera (relativna u odnosu na backend)
    const clientPath = path.resolve(__dirname, "../frontend/dist");

    // Serviranje statičkih fajlova
    app.use(express.static(clientPath));

    // Sve ostale rute → index.html (za React Router)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"))
})
}
// Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: clientOrigin,
        credentials: true,
        methods: ["GET", "POST"]
    },
    pingInterval: 25000,
    pingTimeout: 60000
});

io.use(socketAuthMiddleware);
await initializeSocket(io);
await RedisService.initialize();

// Povezivanje sa bazom i pokretanje servera
try {
    await connectDB();
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {

    });
} catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
}