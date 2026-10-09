import { Requirement } from "../types";

export const socialSecurityReview: Requirement = {
    id: "social-security-review",
    category: "social_security",
    priority: "high",
    status: "required",
    title: "Review social security coverage",
    description: "Your cross-border employment situation may involve the social security systems of both Slovenia and Italy.",
    action: "Verify which country's social security legislation applies to your employment and where social security contributions should be paid.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "May be needed to verify the employer, employment relationship and contractual working arrangements.",
            required: true,
        },
        {
            id: "social-security-record",
            name: "Social security records",
            purpose: "May be needed to verify where social security contributions have been paid.",
            required: false,
        },
        {
            id: "a1-certificate",
            name: "A1 certificate",
            purpose: "May be needed to document which country's social security legislation applies.",
            required: false,
        },
    ],

    sourceIds: [
        "source-eu-social-security",
    ],
};