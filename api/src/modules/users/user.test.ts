import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

/**
 * Prisma is mocked so these tests run without a database.
 * `vi.hoisted` is required because `vi.mock` calls are lifted above imports.
 */
const prismaMock = vi.hoisted(() => ({
    consultation: {
        create: vi.fn(),
        findUnique: vi.fn(),
    },
    user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
    },
}));

vi.mock("../../../lib/prisma", () => ({ prisma: prismaMock }));

import { server } from "../../shared/utils/express";

const EMAIL = "test@oncestack.com";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("POST /api/sign_up", () => {
    it("creates a new user", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockImplementation(async ({ data }: { data: any }) => ({
            id: 1,
            ...data,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        }));

        const response = await request(server)
            .post("/api/sign_up")
            .send({ email: EMAIL, name: "Test User" });

        expect(response.status).toBe(201);
        expect(response.body.valid).toBe(true);
        expect(response.body.msg).toBe("User created!");
        expect(response.body.user.email).toBe(EMAIL);
    });

    it("returns 409 when the email is already registered", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: EMAIL, name: "Test User" });

        const response = await request(server)
            .post("/api/sign_up")
            .send({ email: EMAIL, name: "Another User" });

        expect(response.status).toBe(409);
        expect(response.body.valid).toBe(false);
        expect(response.body.msg).toBe("Email already registered");
    });

    it("does not create a second user for an existing email", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: EMAIL, name: "Test User" });

        await request(server).post("/api/sign_up").send({ email: EMAIL, name: "Another User" });

        expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("looks the user up by email before inserting", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({ id: 2, email: EMAIL, name: null });

        await request(server).post("/api/sign_up").send({ email: EMAIL });

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: EMAIL } });
    });

    it("returns 400 when the insert does not return a user", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue(null);

        const response = await request(server).post("/api/sign_up").send({ email: EMAIL });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.msg).toBe("Cannot create User");
    });

    it("documents that sign_up performs no input validation", async () => {
        // The endpoint is unrelated to the anonymous consultation flow and
        // accepts an empty body, forwarding `undefined` to the database. This
        // test makes that gap explicit; add validation and update it.
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({ id: 3, email: undefined, name: undefined });

        const response = await request(server).post("/api/sign_up").send({});

        expect(response.status).toBe(201);
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: { email: undefined, name: undefined },
        });
    });
});
