const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = ['Fatema', 'Kafi', 'Fahim'];
  
  for (const username of users) {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        }
      });
      console.log(`Created user: ${username} (password: password123)`);
    } else {
      console.log(`User ${username} already exists.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
