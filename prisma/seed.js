const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding ...');

  await prisma.consultation.deleteMany({});

  await prisma.lawyer.deleteMany({});

  await prisma.specialty.deleteMany({});


  const trab = await prisma.specialty.create({
    data: { name: 'Direito Trabalhista' },
  });

  const cons = await prisma.specialty.create({
    data: { name: 'Direito do Consumidor' },
  });

  await prisma.lawyer.create({
    data: {
      name: 'Dra. Maria Oliveira',
      oab: '123456/SP',
      state: 'SP',
      specialtyId: trab.id,
      bio: 'Especialista em direitos trabalhistas com 10 anos de experiência.'
    },
  });

  await prisma.lawyer.create({
    data: {
      name: 'Dr. Pedro Martins',
      oab: '789012/RJ',
      state: 'RJ',
      specialtyId: trab.id
    },
  });
  
  await prisma.lawyer.create({
    data: {
      name: 'Dr. João Silva',
      oab: '345678/SP',
      state: 'SP',
      specialtyId: cons.id
    },
  });

  console.log('Seeding finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });