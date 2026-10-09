import { describe, expect, it, afterEach } from "vitest";
import request from "supertest";
import { server } from "../../shared/utils/express";
import { prisma } from "../../../lib/prisma";

describe("POST /api/sign_up", () => {
    afterEach(async () => {
        await prisma.user.deleteMany({
            where: {
                email: "test@oncestack.com",
            },
        });
    });

    it("creates a new user", async () => {
        const response = await request(server)
            .post("/api/sign_up")
            .send({
                email: "test@oncestack.com",
                name: "Test User",
            });

        expect(response.status).toBe(201);
        expect(response.body.valid).toBe(true);
        expect(response.body.user.email).toBe("test@oncestack.com");
    });

    it("returns 409 when user already exists", async () => {
        await prisma.user.create({
            data: {
                email: "test@oncestack.com",
                name: "Test User",
            },
        });

        const response = await request(server)
            .post("/api/sign_up")
            .send({
                email: "test@oncestack.com",
                name: "Another User",
            });

        expect(response.status).toBe(409);
        expect(response.body.valid).toBe(false);
        expect(response.body.msg).toBe("Email already registered");
    });
});