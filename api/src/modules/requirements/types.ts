export type RequirementCategory =
    | "tax_reporting"
    | "tax_payment"
    | "double_taxation"
    | "social_security"
    | "residence"
    | "documents"
    | "professional_review";

export type RequirementPriority =
    | "high"
    | "medium"
    | "low";

export type RequirementStatus =
    | "required"
    | "recommended"
    | "informational";

export type Requirement = {
    id: string;
    category: RequirementCategory;
    priority: RequirementPriority;
    status: RequirementStatus;
    title: string;
    description: string;
    action?: string;
    documents?: DocumentRequirement[];
    sourceIds: string[];
};

export type DocumentRequirement = {
    id: string;
    name: string;
    purpose: string;
    required: boolean;
};