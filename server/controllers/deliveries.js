const prisma = require('../prismaClient');

const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await prisma.delivery.findMany({
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
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
};

const createDelivery = async (req, res, next) => {
  const { locationId, customerName, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const parsedLocationId = parseInt(locationId, 10);
    if (!parsedLocationId || !customerName || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Location, customer name, and valid product lines are required.' });
    }

    const lastDelivery = await prisma.delivery.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastDelivery ? lastDelivery.id + 1 : 1;
    const reference = `DEL-${String(newId).padStart(3, '0')}`;

    const newDelivery = await prisma.delivery.create({
      data: {
        reference,
        locationId: parsedLocationId,
        customerName,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: parseInt(line.productId, 10),
            orderedQty: parseInt(line.orderedQty || line.orderedQuantity, 10) || 1,
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
    res.status(201).json(newDelivery);
  } catch (error) {
    next(error);
  }
};

const validateDelivery = async (req, res, next) => {
  const { id } = req.params;
  const deliveryId = parseInt(id, 10);
  const userId = req.user.userId;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status === 'DONE') {
      return res.status(400).json({ error: 'Delivery has already been validated.' });
    }

    if (delivery.status === 'CANCELED') {
      return res.status(400).json({ error: 'Delivery is canceled and cannot be validated.' });
    }

    const incomingLines = req.body && Array.isArray(req.body.lines) && req.body.lines.length > 0
      ? req.body.lines
      : delivery.lines.map(l => ({ id: l.id, deliveredQty: l.orderedQty }));

    const operations = [];

    for (const line of incomingLines) {
      const deliveryLine = delivery.lines.find(l => l.id === line.id);
      if (!deliveryLine) continue;

      const deliveredQty = parseInt(line.deliveredQty ?? deliveryLine.orderedQty, 10) || 0;

      const stock = await prisma.stock.findUnique({
        where: {
          productId_locationId: {
            productId: deliveryLine.productId,
            locationId: delivery.locationId,
          },
        },
      });

      const currentQty = stock ? stock.quantity : 0;
      if (!stock || stock.quantity < deliveredQty) {
        const prodName = deliveryLine.product ? deliveryLine.product.name : `Product #${deliveryLine.productId}`;
        const locName = delivery.location ? delivery.location.name : `Location #${delivery.locationId}`;
        return res.status(400).json({
          error: `Insufficient stock for "${prodName}" at "${locName}". Available: ${currentQty}, requested: ${deliveredQty}`,
        });
      }

      operations.push(
        prisma.stock.update({
          where: {
            productId_locationId: {
              productId: deliveryLine.productId,
              locationId: delivery.locationId,
            },
          },
          data: { quantity: { decrement: deliveredQty } },
        })
      );

      operations.push(
        prisma.stockLedger.create({
          data: {
            productId: deliveryLine.productId,
            locationId: delivery.locationId,
            movementType: 'DELIVERY',
            reference: delivery.reference,
            quantityChange: -deliveredQty,
            quantityAfter: stock.quantity - deliveredQty,
            createdById: userId,
          },
        })
      );

      operations.push(
        prisma.deliveryLine.update({
          where: { id: deliveryLine.id },
          data: { deliveredQty },
        })
      );
    }

    operations.push(
      prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: 'DONE', validatedAt: new Date() },
      })
    );

    await prisma.$transaction(operations);

    res.json({ message: 'Delivery validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({ where: { id: parseInt(id, 10) } });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    if (delivery.status === 'DONE') return res.status(400).json({ error: 'Cannot cancel a completed delivery' });

    await prisma.delivery.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'CANCELED' },
    });
    res.json({ message: 'Delivery canceled' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDeliveries,
  createDelivery,
  validateDelivery,
  cancelDelivery,
};
