import { prisma } from '../../lib/prisma'

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'hello@oncestack.com',
            name: 'OnceStack',
        },
    })

    console.log('User created:', user.id)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
    })