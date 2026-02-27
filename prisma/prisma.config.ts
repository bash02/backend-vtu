// prisma/prisma.config.ts
// Prisma v7 config file for MySQL connection


// Export a plain config object if needed by custom tooling

const isProd = process.env.NODE_ENV === "production";
const dbUrl = isProd
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_DEV || process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/dbname';

export default {
  datasource: {
    db: {
      adapter: 'mysql',
      url: dbUrl,
    },
  },
};
