import { afterAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { generateConsultationPdf } from "./pdf.service";
import { makeCaseContext, runPipeline } from "../../test/factories";

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "taxpri-pdf-"));

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** A persisted consultation record, as stored by the repository. */
function makeConsultation() {
    const { caseContext, ruleResults, requirements, report } = runPipeline();

    return {
        id: "0d8a2d0f-5a87-4f7c-8633-13a298d9a9be",
        status: "COMPLETED",
        taxYear: 2025,
        answers: {},
        caseContext,
        ruleResults,
        requirements,
        report,
    };
}

function outputPath(name: string): string {
    return path.join(tmpDir, `${name}.pdf`);
}

describe("generateConsultationPdf", () => {
    it("writes a real PDF file", async () => {
        const file = outputPath("full");

        await generateConsultationPdf(makeConsultation(), file);

        expect(fs.existsSync(file)).toBe(true);
        const bytes = fs.readFileSync(file);
        expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    });

    it("produces a document with a non-trivial size", async () => {
        const file = outputPath("size");

        await generateConsultationPdf(makeConsultation(), file);

        // The Google Sans faces are embedded without subsetting, so a rendered
        // report is comfortably larger than a few kilobytes.
        expect(fs.statSync(file).size).toBeGreaterThan(10_000);
    });

    it("ends the file with the PDF end-of-file marker", async () => {
        const file = outputPath("eof");

        await generateConsultationPdf(makeConsultation(), file);

        const bytes = fs.readFileSync(file);
        expect(bytes.subarray(-1024).toString("latin1")).toContain("%%EOF");
    });

    it("renders the same content twice without failing", async () => {
        const file = outputPath("repeat");

        await generateConsultationPdf(makeConsultation(), file);
        await generateConsultationPdf(makeConsultation(), file);

        expect(fs.readFileSync(file).subarray(0, 5).toString("latin1")).toBe("%PDF-");
    });

    it("does not throw on a minimal record with no case context, report or requirements", async () => {
        const file = outputPath("minimal");

        await expect(
            generateConsultationPdf({ id: "minimal-id", status: "COMPLETED", taxYear: 2025 }, file),
        ).resolves.toBeUndefined();

        expect(fs.readFileSync(file).subarray(0, 5).toString("latin1")).toBe("%PDF-");
    });

    it("renders a case with no requirements at all", async () => {
        const file = outputPath("no-requirements");
        const consultation = makeConsultation();

        await generateConsultationPdf(
            { ...consultation, requirements: [], report: { ...consultation.report, requirements: [] } },
            file,
        );

        expect(fs.existsSync(file)).toBe(true);
    });

    it("renders a case with a single requirement", async () => {
        const file = outputPath("one-requirement");
        const consultation = makeConsultation();

        await generateConsultationPdf(
            { ...consultation, requirements: [consultation.requirements[0]] },
            file,
        );

        expect(fs.existsSync(file)).toBe(true);
    });

    it("renders a property-abroad case with its medium-priority requirement", async () => {
        const file = outputPath("property");
        const { caseContext, ruleResults, requirements, report } = runPipeline(
            makeCaseContext({ propertyAbroad: true }),
        );

        expect(requirements.map((requirement) => requirement.id)).toContain("foreign-property-review");

        await generateConsultationPdf(
            { id: "property-id", status: "COMPLETED", taxYear: 2025, caseContext, ruleResults, requirements, report },
            file,
        );

        expect(fs.statSync(file).size).toBeGreaterThan(10_000);
    });

    it("renders a case with an unusual status without throwing", async () => {
        const file = outputPath("status");
        const consultation = makeConsultation();

        await expect(
            generateConsultationPdf({ ...consultation, status: "EXPIRED" }, file),
        ).resolves.toBeUndefined();
    });
});
