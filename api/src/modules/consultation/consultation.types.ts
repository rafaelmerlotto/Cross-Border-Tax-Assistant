import z from "zod";
import { createConsultationSchema } from "./consultation.schema";

export type CreateConsultationData = {
    taxYear: number;
    answers: any;
    caseContext: any;
    ruleResults: any;
    requirements: any;
    report: any;
};

export type ConsultationInput = {
    taxYear: number;
    answers: z.infer<typeof createConsultationSchema>["answers"] | any;
};