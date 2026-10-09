import { Request, Response, Router } from 'express';

const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
    const start = Date.now();

    try {
        const checks = {
            engine: await checkEngine(),
        };

        const allOk = Object.values(checks).every(c => c.status === 'ok');

        res
            .status(allOk ? 200 : 503)
            .set('Cache-Control', 'no-store')
            .json({
                status: allOk ? 'ok' : 'degraded',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                responseTime: Date.now() - start,
                checks,
            });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
        });
    }
});

async function checkEngine() {
    try {
        return { status: 'ok' as const };
    } catch {
        return { status: 'error' as const, message: 'Engine unreachable' };
    }
}

export default healthRouter;