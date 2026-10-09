import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const professionalReviewRule: Rule = {
    id: "si-it-professional-review",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.employerCountry === "IT" &&
            context.workLocations.length > 1 &&
            context.remoteWork !== "no"
        );
    },

    requirementIds: [
        "tax-residence-professional-review",
    ],
};