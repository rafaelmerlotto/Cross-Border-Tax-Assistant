import { Requirement } from "../types";

export const remoteWorkSocialSecurityReview: Requirement = {
    id: "remote-work-social-security-review",
    category: "social_security",
    priority: "high",
    status: "required",
    title: "Review remote work social security implications",
    description: "Working remotely from Slovenia for an employer in Italy may affect which country's social security legislation applies to your employment.",
    action: "Verify which country's social security system applies to your remote work and whether additional registration or documentation is required.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "May be needed to verify the employer, employment relationship and contractual working arrangements.",
            required: true,
        },
        {
            id: "remote-work-agreement",
            name: "Remote work agreement",
            purpose: "May be needed to verify where remote work is performed and the agreed remote working arrangements.",
            required: false,
        },
        {
            id: "a1-certificate",
            name: "A1 certificate",
            purpose: "May be needed to determine or document which country's social security legislation applies.",
            required: false,
        },
    ],

    sourceIds: [
        "source-eu-social-security",
    ],
};