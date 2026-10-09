import { prisma } from "../../../lib/prisma";
import { CreateConsultationData } from "./consultation.types";

export async function createConsultationRecord(data: CreateConsultationData) {

    const expiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
    );

    return prisma.consultation.create({
        data: {
            taxYear: data.taxYear,
            answers: data.answers,
            caseContext: data.caseContext,
            ruleResults: data.ruleResults,
            requirements: data.requirements,
            report: data.report,

            expiresAt: expiresAt,
            status: "COMPLETED",
            completedAt: new Date(),
        },
    });
}