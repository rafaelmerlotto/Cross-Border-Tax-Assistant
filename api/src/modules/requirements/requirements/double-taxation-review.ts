import { Requirement } from "../types";

export const doubleTaxationReview: Requirement = {
    id: "double-taxation-review",
    category: "double_taxation",
    priority: "high",
    status: "required",
    title: "Review double taxation",
    description: "Your employment income may be taxable in both Slovenia and Italy.",
    action: "Verify which country has the right to tax your employment income and how double taxation is avoided.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "May be needed to determine the employment relationship, employer and applicable tax rules.",
            required: true,
        },
        {
            id: "foreign-tax-certificate",
            name: "Foreign tax certificate",
            purpose: "May be needed to verify taxes paid in Italy and determine whether double taxation relief applies.",
            required: false,
        },
    ],

    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};