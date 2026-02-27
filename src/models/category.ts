

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const CategoryModel = {
  async create(data: { name: string; deleted?: boolean; synced?: boolean }) {
    return prisma.category.create({
      data,
    });
  },
  async findAll() {
    return prisma.category.findMany();
  },
  async findById(id: number) {
    return prisma.category.findUnique({
      where: { id },
    });
  },
  async update(id: number, data: Partial<{ name: string; deleted: boolean; synced: boolean }>) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },
  async delete(id: number) {
    return prisma.category.delete({
      where: { id },
    });
  },
};
