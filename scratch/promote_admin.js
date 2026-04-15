const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function promoteAdmin(email) {
  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`Successfully promoted ${email} to ADMIN.`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error("Error promoting user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
promoteAdmin(email);
