import { CaseContext } from "../case-context/types";
import { Rule, RuleResult } from "./types";
import { foreignIncomeRule } from "./rules/foreign-income";
import { a1CertificateRule } from "./rules/a1-certificate";
import { doubleTaxationRule } from "./rules/double-taxation";
import { professionalReviewRule } from "./rules/professional-review";
import { propertyAbroadRule } from "./rules/property-abroad";
import { remoteWorkTaxRule } from "./rules/remote-work-tax";
import { remoteWorkSocialSecurityRule } from "./rules/remote-work-social-security";
import { socialSecurityRule } from "./rules/social-security";
import { taxResidenceRule } from "./rules/tax-residence";

const rules: Rule[] = [
    foreignIncomeRule,
    a1CertificateRule,
    doubleTaxationRule,
    professionalReviewRule,
    propertyAbroadRule,
    remoteWorkTaxRule,
    remoteWorkSocialSecurityRule,
    socialSecurityRule,
    taxResidenceRule
];

export function evaluateRules(caseContext: CaseContext): RuleResult[] {

    return rules.map((rule) => {
        const triggered = rule.applies(caseContext);

        return {
            ruleId: rule.id,
            triggered,
            requirementIds: triggered ? rule.requirementIds ?? [] : [],
        };
    });
}