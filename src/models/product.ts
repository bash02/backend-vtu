
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ProductModel = {
  async create(data: { name: string; sku: string; price: number; image?: string; category_id?: number; quantity?: number; description?: string; deleted?: boolean; synced?: boolean }) {
    return prisma.product.create({ data });
  },
  async findAll() {
    return prisma.product.findMany();
  },
  async findById(id: number) {
    return prisma.product.findUnique({ where: { id } });
  },
  async update(id: number, data: Partial<{ name: string; sku: string; price: number; image: string; category_id: number; quantity: number; description: string; deleted: boolean; synced: boolean }>) {
    return prisma.product.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.product.delete({ where: { id } });
  },
};
