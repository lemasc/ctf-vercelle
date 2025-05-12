/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check

const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: 1,
      username: "admin",
      password: "whynotPLAINTEXT??",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
