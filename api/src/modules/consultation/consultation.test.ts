import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

/**
 * Prisma is mocked so the HTTP contract can be exercised without a database.
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

const CONSULTATION_ID = "0d8a2d0f-5a87-4f7c-8633-13a298d9a9be";

const validBody = {
    taxYear: 2025,
    answers: {
        residence_country: "SI",
        tax_residence_country: "SI",
        employer_country: "IT",
        employment_type: "EMPLOYEE",
        work_locations: ["SI", "IT"],
        remote_work: true,
        other_income: false,
        other_employer: false,
        property_abroad: false,
    },
};

/** Shape of the `data` argument handed to `prisma.consultation.create`. */
type CreateArgs = { data: Record<string, any> };

function lastCreateArgs(): CreateArgs {
    const calls = prismaMock.consultation.create.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[calls.length - 1][0] as CreateArgs;
}

beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.consultation.create.mockImplementation(async ({ data }: CreateArgs) => ({
        id: CONSULTATION_ID,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        ...data,
    }));
});

describe("POST /api/consultation", () => {
    it("creates a consultation and returns 201", async () => {
        const response = await request(server).post("/api/consultation").send(validBody);

        expect(response.status).toBe(201);
        expect(response.body.valid).toBe(true);
        expect(response.body.msg).toBe("Consultation created!");
        expect(response.body.consultation.id).toBe(CONSULTATION_ID);
    });

    it("runs the whole domain pipeline before persisting", async () => {
        await request(server).post("/api/consultation").send(validBody);

        const { data } = lastCreateArgs();

        expect(data.taxYear).toBe(2025);
        expect(data.answers.residence_country).toBe("SI");

        // case-context: snake_case answers translated to the domain model
        expect(data.caseContext.residenceCountry).toBe("SI");
        expect(data.caseContext.employerCountry).toBe("IT");
        expect(data.caseContext.employmentType).toBe("employee");

        // rules engine
        const ruleIds = data.ruleResults.map((result: any) => result.ruleId);
        expect(ruleIds).toContain("si-it-foreign-income");
        expect(ruleIds).toContain("si-it-a1-certificate");

        // requirements
        const requirementIds = data.requirements.map((requirement: any) => requirement.id);
        expect(requirementIds).toContain("foreign-income-reporting");
        expect(requirementIds).toContain("a1-certificate-review");

        // report
        expect(data.report.summary).toContain("You are resident in Slovenia.");
        expect(data.report.sources.length).toBeGreaterThan(0);
    });

    it("marks the consultation completed with a 30 day expiry", async () => {
        const before = Date.now();
        await request(server).post("/api/consultation").send(validBody);

        const { data } = lastCreateArgs();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        expect(data.status).toBe("COMPLETED");
        expect(data.completedAt).toBeInstanceOf(Date);
        expect(data.expiresAt).toBeInstanceOf(Date);
        expect(data.expiresAt.getTime()).toBeGreaterThanOrEqual(before + thirtyDays - 1000);
        expect(data.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + thirtyDays + 1000);
    });

    it("rejects a body whose tax year is not a number", async () => {
        const response = await request(server)
            .post("/api/consultation")
            .send({ ...validBody, taxYear: "2025" });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
        expect(response.body.msg).toBe("Invalid consultation data");
        expect(response.body.errors).toBeTruthy();
    });

    it("rejects a tax year outside the accepted range", async () => {
        const response = await request(server)
            .post("/api/consultation")
            .send({ ...validBody, taxYear: 1999 });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
    });

    it("rejects a missing answers object", async () => {
        const response = await request(server)
            .post("/api/consultation")
            .send({ taxYear: 2025 });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
    });

    it("rejects an unsupported country code", async () => {
        const response = await request(server)
            .post("/api/consultation")
            .send({
                ...validBody,
                answers: { ...validBody.answers, residence_country: "XX" },
            });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
    });

    it("rejects an unsupported employment type", async () => {
        const response = await request(server)
            .post("/api/consultation")
            .send({
                ...validBody,
                answers: { ...validBody.answers, employment_type: "SELF_EMPLOYED" },
            });

        expect(response.status).toBe(400);
        expect(response.body.valid).toBe(false);
    });

    it("does not persist anything when validation fails", async () => {
        await request(server).post("/api/consultation").send({ taxYear: "nope" });

        expect(prismaMock.consultation.create).not.toHaveBeenCalled();
    });
});

describe("GET /api/consultation/:id", () => {
    it("returns the stored consultation", async () => {
        prismaMock.consultation.findUnique.mockResolvedValue({
            id: CONSULTATION_ID,
            status: "COMPLETED",
            taxYear: 2025,
        });

        const response = await request(server).get(`/api/consultation/${CONSULTATION_ID}`);

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(true);
        expect(response.body.msg).toBe("Consultation found!");
        expect(response.body.consultation.id).toBe(CONSULTATION_ID);
        expect(prismaMock.consultation.findUnique).toHaveBeenCalledWith({
            where: { id: CONSULTATION_ID },
        });
    });

    it("returns 403, not 404, for an unknown consultation", async () => {
        // Documented current behaviour: the controller answers 403 when the
        // record does not exist. Changing this is a deliberate API decision.
        prismaMock.consultation.findUnique.mockResolvedValue(null);

        const response = await request(server).get("/api/consultation/does-not-exist");

        expect(response.status).toBe(403);
        expect(response.body.valid).toBe(false);
        expect(response.body.msg).toBe("Cannot found consultation");
    });
});
