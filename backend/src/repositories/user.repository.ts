import prisma from '../config/database';
// import { User } from '../models/user.model';

export class UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async create(data: any) {
        return prisma.user.create({ data });
    }
}
