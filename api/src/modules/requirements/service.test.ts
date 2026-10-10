import { describe, expect, it } from "vitest";
import { buildRequirements } from "./service";
import { requirements } from "./registry";
import { RuleResult } from "../rules/types";
import { requirementIdsOf, runPipeline } from "../../test/factories";

describe("buildRequirements", () => {
    it("returns nothing when no rule triggered", () => {
        expect(buildRequirements([])).toEqual([]);
        expect(buildRequirements([{ ruleId: "x", triggered: false, requirementIds: ["foreign-income-reporting"] }]))
            .toEqual([]);
    });

    it("resolves the requirement ids of triggered rules", () => {
        const result = buildRequirements([
            { ruleId: "si-it-foreign-income", triggered: true, requirementIds: ["foreign-income-reporting"] },
        ]);

        expect(result.map((requirement) => requirement.id)).toEqual(["foreign-income-reporting"]);
    });

    it("ignores rules that did not trigger", () => {
        const result = buildRequirements([
            { ruleId: "a", triggered: true, requirementIds: ["foreign-income-reporting"] },
            { ruleId: "b", triggered: false, requirementIds: ["double-taxation-review"] },
        ]);

        expect(result.map((requirement) => requirement.id)).toEqual(["foreign-income-reporting"]);
    });

    it("deduplicates a requirement claimed by more than one rule", () => {
        const result = buildRequirements([
            { ruleId: "a", triggered: true, requirementIds: ["double-taxation-review"] },
            { ruleId: "b", triggered: true, requirementIds: ["double-taxation-review"] },
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("double-taxation-review");
    });

    it("silently drops requirement ids that are not in the registry", () => {
        const result = buildRequirements([
            { ruleId: "a", triggered: true, requirementIds: ["does-not-exist"] },
        ]);

        expect(result).toEqual([]);
    });

    it("emits requirements in registry order, not in rule order", () => {
        // `tax-residence-review` is registered after `a1-certificate-review`,
        // so it must come second even though it is requested first.
        const result = buildRequirements([
            { ruleId: "a", triggered: true, requirementIds: ["tax-residence-review"] },
            { ruleId: "b", triggered: true, requirementIds: ["a1-certificate-review"] },
        ]);

        expect(result.map((requirement) => requirement.id)).toEqual([
            "a1-certificate-review",
            "tax-residence-review",
        ]);
    });

    it("returns the very same objects held in the registry", () => {
        const [resolved] = buildRequirements([
            { ruleId: "a", triggered: true, requirementIds: ["foreign-income-reporting"] },
        ]);

        expect(resolved).toBe(requirements.find((requirement) => requirement.id === "foreign-income-reporting"));
    });

    it("does not mutate the rule results it receives", () => {
        const input: RuleResult[] = [
            { ruleId: "a", triggered: true, requirementIds: ["foreign-income-reporting", "employment-documents"] },
        ];
        const snapshot = structuredClone(input);

        buildRequirements(input);

        expect(input).toEqual(snapshot);
    });

    it("produces the documented requirements for a full cross-border case", () => {
        // Slovenian resident, Italian employer, working in both countries and
        // partly remote: this is the scenario the MVP is built around.
        expect(requirementIdsOf()).toEqual([
            "foreign-income-reporting",
            "a1-certificate-review",
            "double-taxation-review",
            "employment-documents",
            "foreign-tax-documents",
            "foreign-tax-paid-verification",
            "remote-work-social-security-review",
            "remote-work-tax-review",
            "social-security-review",
            "tax-residence-professional-review",
            "tax-residence-review",
        ]);
    });

    it("produces a smaller set when the person works in a single country", () => {
        const { caseContext } = runPipeline();
        const ids = requirementIdsOf({
            ...caseContext,
            workLocations: ["IT"],
            remoteWork: "no",
            remoteWorkDays: 0,
        });

        expect(ids).toContain("foreign-income-reporting");
        expect(ids).toContain("double-taxation-review");
        expect(ids).not.toContain("a1-certificate-review");
        expect(ids).not.toContain("social-security-review");
        expect(ids).not.toContain("remote-work-tax-review");
    });

    it("exposes only requirements that rules can actually produce", () => {
        // Every registered requirement should be reachable from at least one
        // rule, otherwise it is dead content in the catalogue.
        const reachable = new Set(requirementIdsOf());
        const unreachable = requirements
            .map((requirement) => requirement.id)
            .filter((id) => !reachable.has(id));

        // `foreign-property-review` needs `propertyAbroad: true`, so it is
        // expected to be the only one missing from the default scenario.
        expect(unreachable).toEqual(["foreign-property-review"]);
    });

    it("includes the foreign property requirement when property abroad is declared", () => {
        const context = { ...runPipeline().caseContext, propertyAbroad: true };
        expect(requirementIdsOf(context)).toContain("foreign-property-review");
    });
});
