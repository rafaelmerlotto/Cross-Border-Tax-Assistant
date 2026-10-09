
export type Report = {
    summary: string[];
    requirements: string[];
    documents: string[];
    attentionPoints: string[];
    professionalReview: {
        recommended: boolean;
        reason?: string;
    };
    sources: any;
};

export type RuleResult = {
    ruleId: string;
    triggered: boolean;
    requirementIds: string[];
};