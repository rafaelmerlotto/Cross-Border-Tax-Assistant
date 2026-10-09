import { Requirement } from "../types";

export const employmentDocuments: Requirement = {
    id: "employment-documents",
    category: "documents",
    priority: "high",
    status: "required",
    title: "Provide employment documents",
    description: "Your cross-border employment situation requires documentation about your employment relationship.",
    action: "Provide your employment contract and other relevant employment documents for review.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose:
                "Used to verify the employment relationship, employer, employment conditions and working arrangements.",
            required: true,
        },
        {
            id: "payslips",
            name: "Payslips",
            purpose:
                "May be needed to verify employment income, taxes and social security contributions.",
            required: false,
        },
        {
            id: "annual-income-statement",
            name: "Annual income statement",
            purpose:
                "May be needed to verify the total employment income and taxes withheld during the tax year.",
            required: false,
        },
    ],

    sourceIds: [],
};