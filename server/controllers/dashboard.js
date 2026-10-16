const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await prisma.product.count();

    const lowStockCountResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT p.id) 
      FROM products p 
      JOIN stocks s ON p.id = s."productId" 
      WHERE s.quantity <= p."reorderLevel" AND s.quantity > 0
    `;
    const lowStockCount = Number(lowStockCountResult[0]?.count || 0);

    const outOfStockCount = await prisma.product.count({
      where: {
        OR: [
          { stocks: { none: {} } },
          { stocks: { every: { quantity: 0 } } },
        ],
      },
    });

    const pendingReceipts = await prisma.receipt.count({
      where: {
        status: {
          in: ['DRAFT', 'READY', 'WAITING'],
        },
      },
    });

    const pendingDeliveries = await prisma.delivery.count({
      where: {
        status: {
          in: ['DRAFT', 'READY', 'WAITING'],
        },
      },
    });

    const recentMovements = await prisma.stockLedger.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      totalProducts,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      recentMovements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
