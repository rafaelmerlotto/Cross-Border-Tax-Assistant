import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const socialSecurityRule: Rule = {
    id: "si-it-social-security",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.employerCountry === "IT" &&
            context.employmentType === "employee" &&
            context.workLocations.length > 1
        );
    },

    requirementIds: [
        "social-security-review",
    ],
};