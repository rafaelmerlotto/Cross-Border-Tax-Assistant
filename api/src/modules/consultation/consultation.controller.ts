import express, { Request, Response, Router } from 'express'
import { prisma } from '../../../lib/prisma'
import { createConsultation } from './consultation.service';
import { CreateConsultationData } from './consultation.types';
import { generateConsultationPdf } from '../pdf/pdf.service';
import path from "path";
import { createConsultationSchema } from './consultation.schema';
import { pdfGenerationLimiter, consultationCreationLimiter } from '../../shared/middleware/rateLimiters';

const consultation: Router = express.Router()

consultation.post("/", consultationCreationLimiter, async (req: Request, res: Response) => {

    // validation Zod
    const result = createConsultationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).send({ valid: false, msg: "Invalid consultation data", errors: result.error.message });
    }

    const consultation = await createConsultation({
        ...req.body,
        ...result.data,
    });


    if (!consultation) {
        return res.status(400).send({ msg: 'Cannot create Consultation', valid: false })
    }
    return res.status(201).send({ consultation: consultation, msg: 'Consultation created!', valid: true })
}
)

consultation.get("/:id", async (req: Request, res: Response) => {
    const { id }: string | undefined | any = req.params

    const consultation: any = await prisma.consultation.findUnique({
        where: {
            id: id,
        }
    })
    if (!consultation) {
        return res.status(403).send({ msg: "Cannot found consultation", valid: false })
    }
    return res.status(200).send({ consultation: consultation, msg: 'Consultation found!', valid: true })
})

consultation.get("/:id/pdf", pdfGenerationLimiter, async (req: Request, res: Response) => {
    const { id }: string | undefined | any = req.params;

    const consultation: any = await prisma.consultation.findUnique({
        where: {
            id: id,
        },
    });

    if (!consultation) {
        return res.status(404).send({ msg: "Consultation not found", valid: false, });
    }

    const filePath: string = path.join(process.cwd(), "tmp", `consultation-${consultation.id}.pdf`);

    await generateConsultationPdf(consultation, filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="consultation-${consultation.id}.pdf"`
    );

    return res.sendFile(filePath);
}
);


export { consultation }