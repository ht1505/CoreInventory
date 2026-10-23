const prisma = require('../prismaClient');

const getAllAdjustments = async (req, res, next) => {
  try {
    const adjustments = await prisma.adjustment.findMany({
      include: {
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.json(adjustments);
  } catch (error) {
    next(error);
  }
};

const createAdjustment = async (req, res, next) => {
  const { locationId, reason, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const parsedLocationId = parseInt(locationId, 10);
    if (!parsedLocationId || !reason || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Location, reason, and valid product lines are required.' });
    }

    const lastAdjustment = await prisma.adjustment.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastAdjustment ? lastAdjustment.id + 1 : 1;
    const reference = `ADJ-${String(newId).padStart(3, '0')}`;

    const newAdjustment = await prisma.adjustment.create({
      data: {
        reference,
        locationId: parsedLocationId,
        reason,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: parseInt(line.productId, 10),
            recordedQty: parseInt(line.recordedQty, 10) || 0,
            actualQty: parseInt(line.actualQty, 10) || 0,
          })),
        },
      },
      include: {
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(201).json(newAdjustment);
  } catch (error) {
    next(error);
  }
};

const validateAdjustment = async (req, res, next) => {
  const { id } = req.params;
  const adjustmentId = parseInt(id, 10);
  const userId = req.user.userId;

  try {
    const adjustment = await prisma.adjustment.findUnique({
      where: { id: adjustmentId },
      include: { lines: true },
    });

    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    if (adjustment.status === 'DONE') {
      return res.status(400).json({ message: 'Adjustment has already been validated.' });
    }

    const operations = [];

    for (const line of adjustment.lines) {
      operations.push(
        prisma.stock.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: adjustment.locationId,
            },
          },
          update: { quantity: line.actualQty },
          create: {
            productId: line.productId,
            locationId: adjustment.locationId,
            quantity: line.actualQty,
          },
        })
      );

      const quantityChange = line.actualQty - line.recordedQty;
      operations.push(
        prisma.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: adjustment.locationId,
            movementType: 'ADJUSTMENT',
            reference: adjustment.reference,
            quantityChange,
            quantityAfter: line.actualQty,
            createdById: userId,
          },
        })
      );
    }

    operations.push(
      prisma.adjustment.update({
        where: { id: adjustmentId },
        data: { status: 'DONE', validatedAt: new Date() },
      })
    );

    await prisma.$transaction(operations);

    res.json({ message: 'Adjustment validated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdjustments,
  createAdjustment,
  validateAdjustment,
};
