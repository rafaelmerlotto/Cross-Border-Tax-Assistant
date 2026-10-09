import { CaseContext } from "../../case-context/types";
import { Rule } from "../types";

export const remoteWorkSocialSecurityRule: Rule = {
    id: "si-it-remote-work-social-security",
    version: "1.0",
    effectiveFrom: "2026-01-01",

    applies: (context: CaseContext) => {
        return (
            context.employerCountry === "IT" &&
            context.residenceCountry === "SI" &&
            context.remoteWork !== "no" &&
            context.remoteWorkDays > 0
        );
    },

    requirementIds: [
        "remote-work-social-security-review",
    ],
};