import { Requirement } from "../types";

export const foreignTaxDocuments: Requirement = {
    id: "foreign-tax-documents",
    category: "documents",
    priority: "high",
    status: "required",
    title: "Provide foreign tax documents",
    description: "Your cross-border employment situation may require documentation related to taxes paid or withheld in Italy.",
    action: "Provide the relevant foreign tax documents to verify income, taxes paid and taxes withheld in Italy.",

    documents: [
        {
            id: "foreign-tax-certificate",
            name: "Foreign tax certificate",
            purpose: "Used to verify income reported and taxes paid or withheld in Italy.",
            required: true,
        },
        {
            id: "italian-income-statement",
            name: "Italian income statement",
            purpose: "May be needed to verify employment income and taxes withheld during the tax year.",
            required: false,
        },
        {
            id: "italian-payslips",
            name: "Italian payslips",
            purpose: "May be needed to verify salary, income tax withholding and social security contributions.",
            required: false,
        },
    ],

    sourceIds: [],
};