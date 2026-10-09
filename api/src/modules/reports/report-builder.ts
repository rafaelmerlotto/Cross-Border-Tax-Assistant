import { CaseContext } from "../case-context/types";
import { Report, RuleResult } from "./types";
import { Requirement } from "../requirements/types";
import { getSourceById } from "../sources/registry";

export function buildReport(
    caseContext: CaseContext,
    ruleResults: RuleResult[],
    requirements: Requirement[]
): Report {

    const summary: string[] = [];
    const attentionPoints: string[] = [];

    const documents = requirements.flatMap((requirement) =>
        (requirement.documents ?? [])
            .filter((document) => document.required)
            .map((document) => document.name)
    );

    const sources = Array.from(
        new Map(
            requirements
                .flatMap((requirement) =>
                    (requirement.sourceIds ?? [])
                        .map((sourceId) => getSourceById(sourceId))
                )
                .filter(
                    (source): source is NonNullable<typeof source> =>
                        source !== undefined
                )
                .map((source) => [source.id, source] as const)
        ).values()
    );

    const requirementTitles = requirements.map(
        (requirement) => requirement.title
    );

    // Summary

    if (caseContext.residenceCountry === "SI") {
        summary.push(
            "You are resident in Slovenia."
        );
    }

    if (caseContext.employerCountry === "IT") {
        summary.push(
            "Your employer is based in Italy."
        );
    }

    if (
        caseContext.workLocations.includes("SI") &&
        caseContext.workLocations.includes("IT")
    ) {
        summary.push(
            "You physically work in both Slovenia and Italy."
        );
    }

    if (
        caseContext.remoteWork === "yes" ||
        caseContext.remoteWork === "partly"
    ) {
        summary.push(
            "You perform remote work from Slovenia."
        );
    }

    // Attention points

    if (caseContext.workLocations.length > 1) {
        attentionPoints.push(
            "Cross-border employment"
        );
    }

    if (
        caseContext.workLocations.includes("SI") &&
        caseContext.workLocations.includes("IT")
    ) {
        attentionPoints.push(
            "Physical work in multiple countries"
        );
    }

    if (
        caseContext.remoteWork === "yes" ||
        caseContext.remoteWork === "partly"
    ) {
        attentionPoints.push(
            "Remote work from Slovenia"
        );
    }

    const professionalReview = requirements.some(
        (requirement) =>
            requirement.id ===
            "tax-residence-professional-review"
    );

    return {
        summary,

        requirements: requirementTitles,

        documents: [...new Set(documents)],

        attentionPoints,

        professionalReview: {
            recommended: professionalReview,
            reason: professionalReview
                ? "The case involves cross-border employment and multiple work locations."
                : undefined,
        },

        sources,
    };
}