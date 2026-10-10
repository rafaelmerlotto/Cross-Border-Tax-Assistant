import { describe, expect, it } from "vitest";
import { getSourceById, sourceRegistry } from "./registry";
import { requirements } from "../requirements/registry";

describe("source registry", () => {
    it("resolves every source id referenced by a requirement", () => {
        // A typo in a requirement's `sourceIds` would otherwise only surface as
        // a source silently missing from the generated report.
        const unresolved: string[] = [];

        for (const requirement of requirements) {
            for (const sourceId of requirement.sourceIds ?? []) {
                if (!getSourceById(sourceId)) {
                    unresolved.push(`${requirement.id} -> ${sourceId}`);
                }
            }
        }

        expect(unresolved).toEqual([]);
    });

    it("uses unique ids", () => {
        const ids = sourceRegistry.map((source) => source.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("returns undefined for an unknown source", () => {
        expect(getSourceById("source-does-not-exist")).toBeUndefined();
    });

    it("provides the metadata the report and PDF rely on", () => {
        for (const source of sourceRegistry) {
            expect(source.id, source.id).toMatch(/^source-[a-z0-9-]+$/);
            expect(source.title.length, source.id).toBeGreaterThan(0);
            expect(source.authority.length, source.id).toBeGreaterThan(0);
            expect(source.effectiveFrom, source.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(["SI", "IT", "EU"]).toContain(source.country);
        }
    });

    it("cites primary official authorities rather than secondary commentary", () => {
        for (const source of sourceRegistry) {
            expect(source.authority, source.id).not.toMatch(/blog|medium|wikipedia|forum/i);
        }
    });

    it("documents that the Slovenia-Italy treaty has no URL yet", () => {
        const treaty = getSourceById("source-si-it-tax-treaty");

        expect(treaty?.type).toBe("tax_treaty");
        expect(treaty?.url).toBeUndefined();
    });

    it("exposes a reachable URL for every other source", () => {
        const withoutUrl = sourceRegistry
            .filter((source) => source.id !== "source-si-it-tax-treaty")
            .filter((source) => !source.url)
            .map((source) => source.id);

        expect(withoutUrl).toEqual([]);
    });
});
