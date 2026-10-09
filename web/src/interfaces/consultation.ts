export interface Document {
    id: string;
    name: string;
    purpose: string;
    required: boolean;
}

export interface Requirement {
    id: string;
    title: string;
    description: string;
    action: string;
    status: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    documents: Document[];
    sourceIds: string[];
}

export interface Source {
    id: string;
    url?: string;
    type: string;
    title: string;
    country: string;
    authority: string;
    description: string;
    effectiveFrom: string;
}

export interface Report {
    sources: Source[];
    summary: string[];
    documents: string[];
    requirements: string[];
    attentionPoints: string[];
    professionalReview: {
        recommended: boolean;
    };
}

export interface ConsultationResult {
    id: string;
    status: string;
    taxYear: number;
    answers: Record<string, any>;
    caseContext: {
        taxYear: number;
        remoteWork: boolean;
        otherIncome: boolean;
        workLocations: string[];
        employmentType: string;
        propertyAbroad: boolean;
        employerCountry: string;
        residenceCountry: string;
        taxResidenceCountry: string;
    };
    ruleResults: Array<{
        ruleId: string;
        triggered: boolean;
        requirementIds: string[];
    }>;
    requirements: Requirement[];
    report: Report;
    createdAt: string;
    completedAt: string;
    expiresAt: string;
}

export interface ResultDashboardProps {
    result: ConsultationResult;
    onReset?: () => void;
}