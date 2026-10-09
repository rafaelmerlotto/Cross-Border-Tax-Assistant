import { Requirement } from "../types";

export const taxResidenceProfessionalReview: Requirement = {
    id: "tax-residence-professional-review",
    category: "professional_review",
    priority: "high",
    status: "required",
    title: "Obtain professional tax residence review",
    description: "Your personal and employment circumstances may require a detailed professional assessment to determine your tax residence.",
    action: "Have a qualified tax professional review your residence, tax residence, physical presence and personal circumstances to determine your applicable tax residence.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "May be needed to verify the employment relationship, employer and working arrangements.",
            required: true,
        },
        {
            id: "residence-documentation",
            name: "Residence documentation",
            purpose: "May be needed to establish where you live and maintain your habitual residence.",
            required: true,
        },
        {
            id: "physical-presence-record",
            name: "Physical presence records",
            purpose: "May be needed to establish the number of days spent in Slovenia and Italy during the relevant tax year.",
            required: false,
        },
    ],

    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};