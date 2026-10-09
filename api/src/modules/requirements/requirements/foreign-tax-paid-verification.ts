import { Requirement } from "../types";

export const foreignTaxPaidVerification: Requirement = {
    id: "foreign-tax-paid-verification",
    category: "double_taxation",
    priority: "high",
    status: "required",
    title: "Verify foreign taxes paid",
    description: "You may have paid or had taxes withheld in Italy on your employment income.",
    action: "Verify the amount of tax paid or withheld in Italy and determine whether it can be considered for double taxation relief in Slovenia.",

    documents: [
        {
            id: "foreign-tax-certificate",
            name: "Foreign tax certificate",
            purpose:
                "Used to verify the amount of income tax paid or withheld in Italy.",
            required: true,
        },
        {
            id: "italian-payslips",
            name: "Italian payslips",
            purpose:
                "May be used to verify income tax withheld from employment income.",
            required: false,
        },
    ],

    sourceIds: [
        "source-si-it-tax-treaty",
    ],
};