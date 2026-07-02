import { createClient } from "redis";

class RedisService {

    constructor() {
        this.client = null
    }
    async initialize() {
        if(this.client) return;

        try {
            this.client = createClient({
                url: process.env.REDIS_URI,
            })
            this.client.on("error", (error) => console.error("Redis client error", error));

            await this.client.connect();
            console.log("Redis connected")
            
        } catch (error) {
            console.error("failed to initialize redis", error)
        }
    }
    async disconnect() {
        if(this.client) {
            await this.client.quit();
            this.client =null;
            console.log("redis disconected")
        }
    }
    async _safe(action, fallback =null){
        if(!this.client) {
            await this.initialize();
            if(!this.client) return fallback;
        }

        try {
            return await action()
        } catch (error) {
            console.error("redis error", error)
            return fallback;
        }
    }
    async addUserSession(userId, socketId) {
        await this._safe(async () => {
            const key = `user:${userId}:sessions`;
            await this.client.sAdd(key, socketId);
            await this.client.expire(key, 600);// 10 minutes
        })
    }
    async getUserSessionsCount(userId) {
        return await this._safe(async () => {
            return this.client.sCard(`user:${userId}:sessions`);
        }, 0)
    }
    async removeUserSessions(userId, socketId) {
        await this._safe(async () => {
            const key = `user:${userId}:sessions`;
            await this.client.sRem(key, socketId);
            const remaining = await this.getUserSessionsCount(userId);
            if(remaining == 0) {
                await this.client.del(key)
            }
        })
    }

    async removeAllUserSessions(userId) {
        await this._safe(async () => {
            await this.client.del(`user:${userId}:sessions`);
        })
    }

    async isUserOnline(userId) {
        const count = await this.getUserSessionsCount(userId);
        return count > 0;
    }
}

export default new RedisService();