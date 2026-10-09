import { Requirement } from "../types";

export const taxResidenceReview: Requirement = {
    id: "tax-residence-review",
    category: "residence",
    priority: "high",
    status: "required",
    title: "Review your tax residence",
    description: "Your residence and cross-border employment circumstances may affect your tax residence in Slovenia and Italy.",
    action: "Verify your tax residence for the relevant tax year based on your residence, physical presence, permanent home and other relevant circumstances.",

    documents: [
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
        {
            id: "permanent-home-documentation",
            name: "Permanent home documentation",
            purpose: "May be needed to determine where you maintain a permanent home.",
            required: false,
        },
    ],

    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};