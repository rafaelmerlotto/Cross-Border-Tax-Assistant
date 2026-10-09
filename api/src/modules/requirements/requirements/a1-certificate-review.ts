import { Requirement } from "../types";

export const a1CertificateReview: Requirement = {
    id: "a1-certificate-review",
    category: "social_security",
    priority: "high",
    status: "required",
    title: "Review A1 certificate requirements",
    description: "Your cross-border employment situation may require an A1 certificate to determine which country's social security legislation applies.",
    action: "Verify whether an A1 certificate is required and which country's social security system should cover your employment.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose:
                "May be needed to verify the employment relationship, employer and working arrangements.",
            required: true,
        },
        {
            id: "a1-certificate",
            name: "A1 certificate",
            purpose:
                "Used to document which country's social security legislation applies to the worker.",
            required: false,
        },
    ],

    sourceIds: [
        "source-a1-certificate",
    ],
};