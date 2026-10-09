import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const taxResidenceRule: Rule = {
    id: "si-it-tax-residence",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.taxResidenceCountry !== "UNKNOWN"
        );
    },

    requirementIds: [
        "tax-residence-review",
    ],
};