import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const propertyAbroadRule: Rule = {
    id: "si-property-abroad",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.residenceCountry === "SI" &&
            context.propertyAbroad === true
        );
    },

    requirementIds: [
        "foreign-property-review",
    ],
};