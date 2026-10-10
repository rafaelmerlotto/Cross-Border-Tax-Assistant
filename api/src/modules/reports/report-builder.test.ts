import { describe, expect, it } from "vitest";
import { buildReport } from "./report-builder";
import { makeCaseContext, runPipeline } from "../../test/factories";
import { Requirement } from "../requirements/types";

describe("buildReport", () => {
    it("describes the default cross-border case in the summary", () => {
        const { report } = runPipeline();

        expect(report.summary).toEqual([
            "You are resident in Slovenia.",
            "Your employer is based in Italy.",
            "You physically work in both Slovenia and Italy.",
            "You perform remote work from Slovenia.",
        ]);
    });

    it("omits the remote work line when the person never works remotely", () => {
        const { report } = runPipeline(makeCaseContext({ remoteWork: "no" }));

        expect(report.summary).not.toContain("You perform remote work from Slovenia.");
    });

    it("omits the multi-country line when work happens in a single country", () => {
        const { report } = runPipeline(makeCaseContext({ workLocations: ["IT"] }));

        expect(report.summary).toContain("Your employer is based in Italy.");
        expect(report.summary).not.toContain("You physically work in both Slovenia and Italy.");
    });

    it("produces an empty summary for an unrelated case", () => {
        const { report } = runPipeline(
            makeCaseContext({
                residenceCountry: "IT",
                employerCountry: "SI",
                workLocations: ["SI"],
                remoteWork: "no",
            }),
        );

        expect(report.summary).toEqual([]);
    });

    it("flags the structural features of the case as attention points", () => {
        const { report } = runPipeline();

        expect(report.attentionPoints).toEqual([
            "Cross-border employment",
            "Physical work in multiple countries",
            "Remote work from Slovenia",
        ]);
    });

    it("lists requirement titles, never ids", () => {
        const { report, requirements } = runPipeline();

        expect(report.requirements).toEqual(requirements.map((requirement) => requirement.title));
        for (const title of report.requirements) {
            expect(title).not.toMatch(/^[a-z0-9-]+$/);
        }
    });

    it("includes only required documents, deduplicated by name", () => {
        const { report } = runPipeline();

        // Many requirements share the employment contract, and the foreign tax
        // certificate appears in three of them, so both must appear only once.
        expect(report.documents).toEqual([
            "Employment contract",
            "Foreign tax certificate",
            "Residence documentation",
        ]);
    });

    it("never lists a document that is only ever optional", () => {
        const { report, requirements } = runPipeline();

        const allDocuments = requirements.flatMap((requirement) => requirement.documents ?? []);
        const requiredNames = new Set(
            allDocuments.filter((document) => document.required).map((document) => document.name),
        );
        const optionalOnlyNames = [...new Set(
            allDocuments.filter((document) => !document.required).map((document) => document.name),
        )].filter((name) => !requiredNames.has(name));

        expect(optionalOnlyNames.length).toBeGreaterThan(0);
        for (const name of optionalOnlyNames) {
            expect(report.documents).not.toContain(name);
        }
    });

    it("reports every document as required somewhere in the catalogue", () => {
        const { report, requirements } = runPipeline();

        const requiredNames = new Set(
            requirements
                .flatMap((requirement) => requirement.documents ?? [])
                .filter((document) => document.required)
                .map((document) => document.name),
        );

        for (const name of report.documents) {
            expect(requiredNames.has(name), name).toBe(true);
        }
    });

    it("treats the same document as required when any requirement requires it", () => {
        // `foreign-tax-certificate` is optional under `double-taxation-review`
        // but required under `foreign-tax-documents` and
        // `foreign-tax-paid-verification`, so it must reach the report.
        const { report, requirements } = runPipeline();

        const certificate = requirements
            .flatMap((requirement) => requirement.documents ?? [])
            .filter((document) => document.id === "foreign-tax-certificate");

        expect(certificate.some((document) => document.required)).toBe(true);
        expect(certificate.some((document) => !document.required)).toBe(true);
        expect(report.documents).toContain("Foreign tax certificate");
    });

    it("resolves and deduplicates the official sources referenced by requirements", () => {
        const { report } = runPipeline();

        expect(report.sources.map((source: { id: string }) => source.id)).toEqual([
            "source-furs-foreign-income",
            "source-a1-certificate",
            "source-si-it-tax-treaty",
            "source-eu-social-security",
        ]);
    });

    it("hydrates sources as full objects, not ids", () => {
        const { report } = runPipeline();

        for (const source of report.sources) {
            expect(source).toMatchObject({
                id: expect.any(String),
                title: expect.any(String),
                authority: expect.any(String),
                country: expect.any(String),
            });
        }
    });

    it("drops source ids that are not in the registry", () => {
        const orphan: Requirement = {
            id: "orphan",
            category: "tax_reporting",
            priority: "low",
            status: "informational",
            title: "Orphan requirement",
            description: "References a source that does not exist.",
            sourceIds: ["source-does-not-exist"],
        };

        const report = buildReport(makeCaseContext(), [], [orphan]);

        expect(report.sources).toEqual([]);
        expect(report.requirements).toEqual(["Orphan requirement"]);
    });

    it("recommends a professional review for a remote, multi-location case", () => {
        const { report } = runPipeline();

        expect(report.professionalReview.recommended).toBe(true);
        expect(report.professionalReview.reason).toBe(
            "The case involves cross-border employment and multiple work locations.",
        );
    });

    it("does not recommend a professional review when the triggering requirement is absent", () => {
        const { report } = runPipeline(makeCaseContext({ remoteWork: "no" }));

        expect(report.professionalReview.recommended).toBe(false);
        expect(report.professionalReview.reason).toBeUndefined();
    });

    it("handles an empty requirement list without throwing", () => {
        const report = buildReport(makeCaseContext(), [], []);

        // The summary still describes the case facts, but nothing is actionable.
        expect(report.requirements).toEqual([]);
        expect(report.documents).toEqual([]);
        expect(report.sources).toEqual([]);
        expect(report.professionalReview.recommended).toBe(false);
    });

    it("does not mutate the requirements it receives", () => {
        const { ruleResults, requirements } = runPipeline();
        const snapshot = structuredClone(requirements);

        buildReport(makeCaseContext(), ruleResults, requirements);

        expect(requirements).toEqual(snapshot);
    });

    it("documents the remote work type mismatch between the wire and the domain", () => {
        // The HTTP path delivers `remoteWork` as a boolean, while the report
        // compares it against the strings "yes" / "partly". Until the contract
        // is unified, a remote worker receives no remote-work summary line.
        const { report } = runPipeline(makeCaseContext({ remoteWork: true as never }));

        expect(report.summary).not.toContain("You perform remote work from Slovenia.");
        expect(report.attentionPoints).not.toContain("Remote work from Slovenia");
    });
});
