import { Requirement } from "../types";

export const foreignIncomeReporting: Requirement =
{
    id: "foreign-income-reporting",
    category: "tax_reporting",
    priority: "high",
    status: "required",
    title: "Check foreign employment income reporting",
    description: "Your situation involves employment income from an Italian employer while you live in Slovenia.",
    action: "Verify how and where this income must be reported to the Slovenian tax authority.",

    documents: [
        {
            id: "employment-contract",
            name: "Employment contract",
            purpose: "May be needed to verify the employment relationship and employer.",
            required: true,
        },
    ],

    sourceIds: [
        "source-furs-foreign-income",
    ],
}
