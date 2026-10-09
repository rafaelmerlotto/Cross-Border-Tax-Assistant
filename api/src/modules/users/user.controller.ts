import express, { Request, Response, Router } from 'express'
import { prisma } from '../../../lib/prisma'

const user: Router = express.Router()

user.post('/sign_up', async (req: Request, res: Response) => {
    const { email, name } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        return res.status(409).json({ msg: "Email already registered", valid: false })
    }
    const user: User | null = await prisma.user.create({
        data: {
            email: email,
            name: name
        }
    })
    if (!user) {
        return res.status(400).send({ msg: 'Cannot create User', valid: false })
    }
    return res.status(201).send({ user: user, msg: 'User created!', valid: true })
})

export { user }