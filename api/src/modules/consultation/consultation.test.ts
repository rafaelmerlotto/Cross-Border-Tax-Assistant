import { describe, expect, it, afterEach } from "vitest";
import request from "supertest";
import { server } from "../../shared/utils/express";
import { answersMock, caseContextMock, reportMock, requirementsMock, ruleResultsMock } from "./consultation.mock.test";

describe("POST /api/consultation", () => {
    it("creates a new consultation", async () => {

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

        const response = await request(server)
            .post("/api/sign_up")
            .send({
                taxYear: "2025",
                answers: answersMock,
                caseContext: caseContextMock,
                ruleResults: ruleResultsMock,
                requirements: requirementsMock,
                report: reportMock,

                expiresAt: expiresAt,
                status: "COMPLETED",
                completedAt: new Date(),
            });

        expect(response.status).toBe(201);
        expect(response.body.valid).toBe(true);
    });
});