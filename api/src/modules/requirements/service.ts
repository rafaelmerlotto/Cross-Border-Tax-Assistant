import { RuleResult } from "../rules/types";
import { requirements } from "./registry";
import { Requirement } from "./types";

export function buildRequirements(ruleResults: RuleResult[]): Requirement[] {

    const requirementIds = ruleResults
        .filter(rule => rule.triggered)
        .flatMap(rule => rule.requirementIds);


    return requirements.filter(requirement =>
        requirementIds.includes(requirement.id)
    );
}