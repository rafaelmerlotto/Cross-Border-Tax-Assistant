import dotenv from "dotenv";
import { server } from "./shared/utils/express";
import { Request, Response } from 'express'

dotenv.config();

server.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        service: "TaxPri Cross-Border Tax Assistant",
        description: "Cross-border tax analysis and consultation service.",
        status: "operational",
        timestamp: new Date().toISOString()
    });
});

const PORT: string | 4000 = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});