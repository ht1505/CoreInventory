const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { movementType } = req.query;
    const where = {};
    if (movementType && movementType !== 'ALL') {
      where.movementType = { equals: movementType, mode: 'insensitive' };
    }

    const entries = await prisma.stockLedger.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        location: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(entries);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
