import { Requirement } from "../types";

export const remoteWorkTaxReview: Requirement = {
    id: "remote-work-tax-review",
    category: "tax_reporting",
    priority: "high",
    status: "required",
    title: "Review remote work tax implications",
    description: "Working remotely from Slovenia for an employer in Italy may affect where your employment income is taxable.",
    action: "Verify the tax implications of performing employment duties remotely from Slovenia and determine where the related income must be reported.",

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
            id: "work-location-record",
            name: "Work location records",
            purpose: "May be needed to establish the countries where employment duties were physically performed during the tax year.",
            required: false,
        },
    ],

    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};