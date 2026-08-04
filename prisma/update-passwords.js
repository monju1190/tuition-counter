const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'Fatema', pass: 'fatema123' },
    { username: 'Kafi', pass: 'kafi123' },
    { username: 'Fahim', pass: 'fahim123' }
  ];
  
  for (const {username, pass} of users) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword }
    });
    console.log(`Updated password for ${username} to: ${pass}`);
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
