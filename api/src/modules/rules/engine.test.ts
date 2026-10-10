import { describe, expect, it } from "vitest";
import { evaluateRules } from "./engine";
import { Rule } from "./types";
import { makeCaseContext } from "../../test/factories";
import { requirements } from "../requirements/registry";

import { foreignIncomeRule } from "./rules/foreign-income";
import { a1CertificateRule } from "./rules/a1-certificate";
import { doubleTaxationRule } from "./rules/double-taxation";
import { professionalReviewRule } from "./rules/professional-review";
import { propertyAbroadRule } from "./rules/property-abroad";
import { remoteWorkTaxRule } from "./rules/remote-work-tax";
import { remoteWorkSocialSecurityRule } from "./rules/remote-work-social-security";
import { socialSecurityRule } from "./rules/social-security";
import { taxResidenceRule } from "./rules/tax-residence";

/**
 * The rules as they are registered in `engine.ts`. Kept here so the tests can
 * detect a rule that is defined but never registered, and vice versa.
 */
const registry: Rule[] = [
    foreignIncomeRule,
    a1CertificateRule,
    doubleTaxationRule,
    professionalReviewRule,
    propertyAbroadRule,
    remoteWorkTaxRule,
    remoteWorkSocialSecurityRule,
    socialSecurityRule,
    taxResidenceRule,
];

const registeredRequirementIds = new Set(requirements.map((requirement) => requirement.id));

describe("evaluateRules", () => {
    it("evaluates every registered rule, in a stable order", () => {
        const results = evaluateRules(makeCaseContext());
        expect(results.map((result) => result.ruleId)).toEqual(registry.map((rule) => rule.id));
    });

    it("returns one result per rule, regardless of how many trigger", () => {
        const results = evaluateRules(makeCaseContext());
        expect(results).toHaveLength(registry.length);
    });

    it("reports an empty requirementIds array for rules that did not trigger", () => {
        const results = evaluateRules(makeCaseContext({ employerCountry: "SI", residenceCountry: "IT" }));
        const notTriggered = results.filter((result) => !result.triggered);

        expect(notTriggered.length).toBeGreaterThan(0);
        for (const result of notTriggered) {
            expect(result.requirementIds, result.ruleId).toEqual([]);
        }
    });

    it("reports at least one requirement for every rule that triggered", () => {
        const results = evaluateRules(makeCaseContext());
        const triggered = results.filter((result) => result.triggered);

        expect(triggered.length).toBeGreaterThan(0);
        for (const result of triggered) {
            expect(result.requirementIds.length, result.ruleId).toBeGreaterThan(0);
        }
    });

    it("only ever references requirement ids that exist in the registry", () => {
        // Guards against a typo in a rule silently producing no requirement,
        // because buildRequirements drops unknown ids without warning.
        const dangling: string[] = [];

        for (const rule of registry) {
            for (const requirementId of rule.requirementIds ?? []) {
                if (!registeredRequirementIds.has(requirementId)) {
                    dangling.push(`${rule.id} -> ${requirementId}`);
                }
            }
        }

        expect(dangling).toEqual([]);
    });

    it("gives every rule a version and an ISO effective date", () => {
        for (const rule of registry) {
            expect(rule.version, rule.id).toMatch(/^\d+\.\d+$/);
            expect(rule.effectiveFrom, rule.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
    });

    it("uses unique rule ids", () => {
        const ids = registry.map((rule) => rule.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("is deterministic and does not mutate the case context", () => {
        const context = makeCaseContext();
        const snapshot = structuredClone(context);

        expect(evaluateRules(context)).toEqual(evaluateRules(context));
        expect(context).toEqual(snapshot);
    });

    it("does not throw on a sparse context", () => {
        const sparse = {
            residenceCountry: "SI",
            employerCountry: "IT",
            employmentType: "employee",
            workLocations: ["IT"],
        } as never;

        expect(() => evaluateRules(sparse)).not.toThrow();
    });
});

/** Convenience wrapper: does this rule apply to the default case, with tweaks? */
function applies(rule: Rule, overrides: Parameters<typeof makeCaseContext>[0] = {}): boolean {
    return rule.applies(makeCaseContext(overrides));
}

describe("rule si-it-foreign-income", () => {
    it("applies to a Slovenian resident employed by an Italian employer", () => {
        expect(applies(foreignIncomeRule)).toBe(true);
    });

    it("does not apply when the employer is not Italian", () => {
        expect(applies(foreignIncomeRule, { employerCountry: "SI" })).toBe(false);
    });

    it("does not apply when the user is not resident in Slovenia", () => {
        expect(applies(foreignIncomeRule, { residenceCountry: "IT" })).toBe(false);
    });

    it("produces the reporting and documents requirements", () => {
        expect(foreignIncomeRule.requirementIds).toEqual([
            "foreign-income-reporting",
            "employment-documents",
        ]);
    });
});

describe("rule si-it-double-taxation", () => {
    it("applies to a Slovenian resident employed by an Italian employer", () => {
        expect(applies(doubleTaxationRule)).toBe(true);
    });

    it("does not apply when the employer is not Italian", () => {
        expect(applies(doubleTaxationRule, { employerCountry: "SI" })).toBe(false);
    });

    it("produces the double taxation requirements", () => {
        expect(doubleTaxationRule.requirementIds).toEqual([
            "double-taxation-review",
            "foreign-tax-paid-verification",
            "foreign-tax-documents",
        ]);
    });
});

describe("rule si-it-a1-certificate", () => {
    it("applies when work is split between Slovenia and Italy for an Italian employer", () => {
        expect(applies(a1CertificateRule)).toBe(true);
    });

    it("does not apply when work happens only in Italy", () => {
        expect(applies(a1CertificateRule, { workLocations: ["IT"] })).toBe(false);
    });

    it("does not apply when work happens only in Slovenia", () => {
        expect(applies(a1CertificateRule, { workLocations: ["SI"] })).toBe(false);
    });

    it("is insensitive to the order of the work locations", () => {
        expect(applies(a1CertificateRule, { workLocations: ["IT", "SI"] })).toBe(true);
    });
});

describe("rule si-it-social-security", () => {
    it("applies when the person works in more than one country", () => {
        expect(applies(socialSecurityRule)).toBe(true);
    });

    it("does not apply when the person works in a single country", () => {
        expect(applies(socialSecurityRule, { workLocations: ["SI"] })).toBe(false);
    });

    it("does not apply when the employer is not Italian", () => {
        expect(applies(socialSecurityRule, { employerCountry: "SI" })).toBe(false);
    });
});

describe("rule si-it-tax-residence", () => {
    it("applies to a Slovenian resident with a known tax residence", () => {
        expect(applies(taxResidenceRule)).toBe(true);
    });

    it("does not apply when the tax residence is unknown", () => {
        expect(applies(taxResidenceRule, { taxResidenceCountry: "UNKNOWN" })).toBe(false);
    });

    it("does not apply when the user is not resident in Slovenia", () => {
        expect(applies(taxResidenceRule, { residenceCountry: "IT" })).toBe(false);
    });
});

describe("rule si-it-professional-review", () => {
    it("applies to a partly remote cross-border worker with multiple work locations", () => {
        expect(applies(professionalReviewRule)).toBe(true);
    });

    it("does not apply when the person never works remotely", () => {
        expect(applies(professionalReviewRule, { remoteWork: "no" })).toBe(false);
    });

    it("does not apply when the person works in a single location", () => {
        expect(applies(professionalReviewRule, { workLocations: ["IT"] })).toBe(false);
    });

    it("applies when the person works remotely full time", () => {
        expect(applies(professionalReviewRule, { remoteWork: "yes" })).toBe(true);
    });
});

describe("rule si-it-remote-work-tax", () => {
    it("applies when remote work days are recorded", () => {
        expect(applies(remoteWorkTaxRule)).toBe(true);
    });

    it("does not apply when no remote work days are recorded", () => {
        expect(applies(remoteWorkTaxRule, { remoteWorkDays: 0 })).toBe(false);
    });

    it("does not apply when remote work days are missing entirely", () => {
        // This is the shape produced by the HTTP path today, because the Zod
        // schema does not declare `remote_work_days`. `undefined > 0` is false.
        expect(applies(remoteWorkTaxRule, { remoteWorkDays: undefined as never })).toBe(false);
    });

    it("does not apply when the person never works remotely", () => {
        expect(applies(remoteWorkTaxRule, { remoteWork: "no" })).toBe(false);
    });

    it("does not apply when the employer is not Italian", () => {
        expect(applies(remoteWorkTaxRule, { employerCountry: "SI" })).toBe(false);
    });
});

describe("rule si-it-remote-work-social-security", () => {
    it("applies when remote work days are recorded", () => {
        expect(applies(remoteWorkSocialSecurityRule)).toBe(true);
    });

    it("does not apply when no remote work days are recorded", () => {
        expect(applies(remoteWorkSocialSecurityRule, { remoteWorkDays: 0 })).toBe(false);
    });

    it("shares its precondition with the remote-work tax rule", () => {
        const cases = [
            {},
            { remoteWorkDays: 0 },
            { remoteWork: "no" as const },
            { employerCountry: "SI" as const },
            { residenceCountry: "IT" as const },
        ];

        for (const overrides of cases) {
            expect(
                applies(remoteWorkSocialSecurityRule, overrides),
                JSON.stringify(overrides),
            ).toBe(applies(remoteWorkTaxRule, overrides));
        }
    });
});

describe("rule si-property-abroad", () => {
    it("does not apply when there is no foreign property", () => {
        expect(applies(propertyAbroadRule)).toBe(false);
    });

    it("applies to a Slovenian resident owning property abroad", () => {
        expect(applies(propertyAbroadRule, { propertyAbroad: true })).toBe(true);
    });

    it("does not apply when the owner is not resident in Slovenia", () => {
        expect(applies(propertyAbroadRule, { propertyAbroad: true, residenceCountry: "IT" })).toBe(false);
    });

    it("requires the boolean flag to be strictly true", () => {
        expect(applies(propertyAbroadRule, { propertyAbroad: undefined as never })).toBe(false);
    });
});
