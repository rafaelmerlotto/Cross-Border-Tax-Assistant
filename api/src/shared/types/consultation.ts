type Consultation = {
    id: string;
    status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED";

    taxYear: number;

    answers: Record<string, unknown>;
    caseContext?: Record<string, unknown>;
    ruleResults?: Record<string, unknown>;
    requirements?: Record<string, unknown>;
    report?: Record<string, unknown>;

    createdAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
};