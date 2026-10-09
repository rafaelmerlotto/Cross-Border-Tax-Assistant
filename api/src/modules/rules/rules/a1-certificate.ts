import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";


export const a1CertificateRule: Rule = {
    id: "si-it-a1-certificate",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.employerCountry === "IT" &&
            context.workLocations.includes("SI") &&
            context.workLocations.includes("IT")
        );
    },

    requirementIds: [
        "a1-certificate-review",
    ],
};