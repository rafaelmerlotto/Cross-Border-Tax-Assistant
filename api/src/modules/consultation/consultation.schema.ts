import { z } from "zod";


export const createConsultationSchema = z.object({
    taxYear: z.number().int().min(2000).max(2100),

    answers: z.object({
        residence_country: z.enum(["SI", "IT", "AT", "HR", "OTHER"]),
        tax_residence_country: z.enum(["SI", "IT", "AT", "HR", "OTHER"]),
        employer_country: z.enum(["SI", "IT", "AT", "HR", "OTHER"]),

        employment_type: z.enum(["EMPLOYEE"]),

        work_locations: z.array(
            z.enum(["SI", "IT", "AT", "HR", "OTHER"])
        ),

        remote_work: z.boolean(),
        other_income: z.boolean(),
        other_employer: z.boolean(),
        property_abroad: z.boolean(),
    }),
});