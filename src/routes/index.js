const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/specialties', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar as especialidades.' });
  }
});

router.get('/lawyers', async (req, res) => {
  const { specialty, state, sortBy = 'name', order = 'asc', page = 1, limit = 10 } = req.query;

  const whereClause = {};
  if (specialty) {
    whereClause.specialty = { name: { equals: specialty, mode: 'insensitive' } };
  }
  if (state) {
    whereClause.state = { equals: state, mode: 'insensitive' };
  }

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const lawyers = await prisma.lawyer.findMany({
      where: whereClause,
      include: { specialty: true },
      orderBy: {
        [sortBy]: order,
      },
      skip: skip,
      take: pageSize,
    });

    const totalLawyers = await prisma.lawyer.count({ where: whereClause });
    const totalPages = Math.ceil(totalLawyers / pageSize);

    res.json({
      data: lawyers,
      pagination: {
        totalItems: totalLawyers,
        totalPages: totalPages,
        currentPage: pageNumber,
        pageSize: pageSize,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Não foi possível buscar os advogados.' });
  }
});

router.post('/consultations', async (req, res) => {
  const { userId, lawyerId, description } = req.body;
  try {
    const lawyerExists = await prisma.lawyer.findUnique({
      where: { id: parseInt(lawyerId) },
    });

    if (!lawyerExists) {
      return res.status(404).json({ error: 'Advogado não encontrado com o ID fornecido.' });
    }

    const newConsultation = await prisma.consultation.create({
      data: {
        userId: parseInt(userId),
        lawyerId: parseInt(lawyerId),
        description: description,
      },
    });
    res.status(201).json(newConsultation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Não foi possível agendar a consulta.' });
  }
});

router.get('/lawyers/:id', async (req, res) => {
  const lawyerId = parseInt(req.params.id);
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: { specialty: true },
    });

    if (!lawyer) {
      return res.status(404).json({ error: 'Advogado não encontrado.' });
    }
    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar o advogado.' });
  }
});

router.patch('/consultations/:id', async (req, res) => {
  const consultationId = parseInt(req.params.id);
  const { status } = req.body;

  if (!['PENDENTE', 'EM_ANDAMENTO', 'FINALIZADA'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: status },
    });
    res.json(updatedConsultation);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.status(500).json({ error: 'Não foi possível atualizar a consulta.' });
  }
});

module.exports = router;