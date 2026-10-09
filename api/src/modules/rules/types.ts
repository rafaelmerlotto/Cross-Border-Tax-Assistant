import { CaseContext } from "../case-context/types";

export type RuleResult = {
    ruleId: string;
    triggered: boolean;
    requirementIds: string[];
};

export type Rule = {
    id: string;
    version: string;
    effectiveFrom: string;

    applies: (context: CaseContext) => boolean;

    requirementIds?: string[];
};