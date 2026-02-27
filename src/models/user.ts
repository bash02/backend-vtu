
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const UserModel = {
  async create(data: { name: string; email: string; password: string; role?: string; deleted?: boolean; synced?: boolean }) {
    return prisma.user.create({ data });
  },
  async findAll() {
    return prisma.user.findMany();
  },
  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },
  async update(id: number, data: Partial<{ name: string; email: string; password: string; role: string; deleted: boolean; synced: boolean }>) {
    return prisma.user.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  },
};
