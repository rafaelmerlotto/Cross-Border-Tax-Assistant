import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const foreignIncomeRule: Rule = {
    id: "si-it-foreign-income",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.employerCountry === "IT" &&
            context.employmentType === "employee"
        );
    },

    requirementIds: [
        "foreign-income-reporting",
        "employment-documents",
    ],
};