import { prisma } from '../../lib/prisma'
import { seedConsultations } from './consultation.seed';


async function main() {
    await seedConsultations();
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });