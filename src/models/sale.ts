

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SaleModel = {
  async create(data: { items: string; total_amount: number; payment_method?: string; deleted?: boolean; synced?: boolean }) {
    return prisma.sale.create({ data });
  },
  async findAll() {
    return prisma.sale.findMany();
  },
  async findById(id: number) {
    return prisma.sale.findUnique({ where: { id } });
  },
  async update(id: number, data: Partial<{ items: string; total_amount: number; payment_method: string; deleted: boolean; synced: boolean }>) {
    return prisma.sale.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.sale.delete({ where: { id } });
  },
};
