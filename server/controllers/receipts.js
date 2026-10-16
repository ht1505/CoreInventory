const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllReceipts = async (req, res, next) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        supplier: true,
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.json(receipts);
  } catch (error) {
    next(error);
  }
};

const createReceipt = async (req, res, next) => {
  const { supplierId, locationId, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const parsedSupplierId = parseInt(supplierId, 10);
    const parsedLocationId = parseInt(locationId, 10);

    if (!parsedSupplierId || !parsedLocationId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Supplier, location, and valid product lines are required.' });
    }

    const lastReceipt = await prisma.receipt.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastReceipt ? lastReceipt.id + 1 : 1;
    const reference = `REC-${String(newId).padStart(3, '0')}`;

    const newReceipt = await prisma.receipt.create({
      data: {
        reference,
        supplierId: parsedSupplierId,
        locationId: parsedLocationId,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: parseInt(line.productId, 10),
            expectedQty: parseInt(line.expectedQty || line.expectedQuantity, 10) || 1,
          })),
        },
      },
      include: {
        supplier: true,
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(201).json(newReceipt);
  } catch (error) {
    next(error);
  }
};

const validateReceipt = async (req, res, next) => {
  const { id } = req.params;
  const receiptId = parseInt(id, 10);
  const userId = req.user.userId;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { lines: true },
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'DONE') {
      return res.status(400).json({ message: 'Receipt has already been validated.' });
    }

    // Default to receipt lines if lines not sent in request body
    const incomingLines = req.body && Array.isArray(req.body.lines) && req.body.lines.length > 0
      ? req.body.lines
      : receipt.lines.map(l => ({ id: l.id, receivedQty: l.expectedQty }));

    const operations = [];

    for (const line of incomingLines) {
      const receiptLine = receipt.lines.find(l => l.id === line.id);
      if (!receiptLine) continue;

      const receivedQty = parseInt(line.receivedQty ?? receiptLine.expectedQty, 10) || 0;

      // Update line receivedQty
      operations.push(
        prisma.receiptLine.update({
          where: { id: receiptLine.id },
          data: { receivedQty },
        })
      );

      // Check current stock
      const existingStock = await prisma.stock.findUnique({
        where: {
          productId_locationId: {
            productId: receiptLine.productId,
            locationId: receipt.locationId,
          },
        },
      });

      const currentQty = existingStock ? existingStock.quantity : 0;
      const quantityAfter = currentQty + receivedQty;

      // Upsert stock
      operations.push(
        prisma.stock.upsert({
          where: {
            productId_locationId: {
              productId: receiptLine.productId,
              locationId: receipt.locationId,
            },
          },
          update: { quantity: { increment: receivedQty } },
          create: {
            productId: receiptLine.productId,
            locationId: receipt.locationId,
            quantity: receivedQty,
          },
        })
      );

      // Ledger entry with uppercase RECEIPT
      operations.push(
        prisma.stockLedger.create({
          data: {
            productId: receiptLine.productId,
            locationId: receipt.locationId,
            movementType: 'RECEIPT',
            reference: receipt.reference,
            quantityChange: receivedQty,
            quantityAfter,
            createdById: userId,
          },
        })
      );
    }

    // Update status to DONE
    operations.push(
      prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'DONE', validatedAt: new Date() },
      })
    );

    await prisma.$transaction(operations);

    res.json({ message: 'Receipt validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.receipt.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'CANCELED' },
    });
    res.json({ message: 'Receipt canceled' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReceipts,
  createReceipt,
  validateReceipt,
  cancelReceipt,
};
