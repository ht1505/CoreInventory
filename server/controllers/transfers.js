const prisma = require('../prismaClient');

const getAllTransfers = async (req, res, next) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromLocation: true,
        toLocation: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.json(transfers);
  } catch (error) {
    next(error);
  }
};

const createTransfer = async (req, res, next) => {
  const { fromLocationId, toLocationId, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const parsedFromId = parseInt(fromLocationId, 10);
    const parsedToId = parseInt(toLocationId, 10);

    if (!parsedFromId || !parsedToId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Source, destination, and valid product lines are required.' });
    }

    if (parsedFromId === parsedToId) {
      return res.status(400).json({ error: 'Source and destination locations cannot be identical.' });
    }

    const lastTransfer = await prisma.transfer.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastTransfer ? lastTransfer.id + 1 : 1;
    const reference = `TRF-${String(newId).padStart(3, '0')}`;

    const newTransfer = await prisma.transfer.create({
      data: {
        reference,
        fromLocationId: parsedFromId,
        toLocationId: parsedToId,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: parseInt(line.productId, 10),
            quantity: parseInt(line.quantity, 10) || 1,
          })),
        },
      },
      include: {
        fromLocation: true,
        toLocation: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(201).json(newTransfer);
  } catch (error) {
    next(error);
  }
};

const validateTransfer = async (req, res, next) => {
  const { id } = req.params;
  const transferId = parseInt(id, 10);
  const userId = req.user.userId;

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        fromLocation: true,
        toLocation: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (transfer.status === 'DONE') {
      return res.status(400).json({ error: 'Transfer has already been validated.' });
    }

    if (transfer.status === 'CANCELED') {
      return res.status(400).json({ error: 'Transfer is canceled and cannot be validated.' });
    }

    const operations = [];

    for (const line of transfer.lines) {
      const fromStock = await prisma.stock.findUnique({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: transfer.fromLocationId,
          },
        },
      });

      const currentQty = fromStock ? fromStock.quantity : 0;
      if (!fromStock || fromStock.quantity < line.quantity) {
        const prodName = line.product ? line.product.name : `Product #${line.productId}`;
        const fromLocName = transfer.fromLocation ? transfer.fromLocation.name : `Location #${transfer.fromLocationId}`;
        return res.status(400).json({
          error: `Insufficient stock for "${prodName}" at "${fromLocName}". Available: ${currentQty}, requested: ${line.quantity}`,
        });
      }

      const toStock = await prisma.stock.findUnique({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: transfer.toLocationId,
          },
        },
      });

      operations.push(
        prisma.stock.update({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: transfer.fromLocationId,
            },
          },
          data: { quantity: { decrement: line.quantity } },
        })
      );

      operations.push(
        prisma.stock.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: transfer.toLocationId,
            },
          },
          update: { quantity: { increment: line.quantity } },
          create: {
            productId: line.productId,
            locationId: transfer.toLocationId,
            quantity: line.quantity,
          },
        })
      );

      operations.push(
        prisma.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: transfer.fromLocationId,
            movementType: 'TRANSFER',
            reference: `${transfer.reference} (OUT)`,
            quantityChange: -line.quantity,
            quantityAfter: fromStock.quantity - line.quantity,
            createdById: userId,
          },
        })
      );

      operations.push(
        prisma.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: transfer.toLocationId,
            movementType: 'TRANSFER',
            reference: `${transfer.reference} (IN)`,
            quantityChange: line.quantity,
            quantityAfter: (toStock ? toStock.quantity : 0) + line.quantity,
            createdById: userId,
          },
        })
      );
    }

    operations.push(
      prisma.transfer.update({
        where: { id: transferId },
        data: { status: 'DONE', validatedAt: new Date() },
      })
    );

    await prisma.$transaction(operations);

    res.json({ message: 'Transfer validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({ where: { id: parseInt(id, 10) } });
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
    if (transfer.status === 'DONE') return res.status(400).json({ error: 'Cannot cancel a completed transfer' });

    await prisma.transfer.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'CANCELED' },
    });
    res.json({ message: 'Transfer canceled' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransfers,
  createTransfer,
  validateTransfer,
  cancelTransfer,
};
