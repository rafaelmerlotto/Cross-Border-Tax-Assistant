import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const doubleTaxationRule: Rule = {
    id: "si-it-double-taxation",
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
        "double-taxation-review",
        "foreign-tax-paid-verification",
        "foreign-tax-documents",
    ],
};