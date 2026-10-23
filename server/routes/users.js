const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            receipts: true,
            deliveries: true,
            transfers: true,
            adjustments: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const targetUserId = parseInt(req.params.id, 10);

    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Only managers can remove users.' });
    }

    if (adminId === targetUserId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Safely reassign audit relations to the acting admin before deletion to avoid foreign key violations
    await prisma.$transaction([
      prisma.receipt.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminId },
      }),
      prisma.delivery.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminId },
      }),
      prisma.transfer.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminId },
      }),
      prisma.adjustment.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminId },
      }),
      prisma.stockLedger.updateMany({
        where: { createdById: targetUserId },
        data: { createdById: adminId },
      }),
      prisma.user.delete({
        where: { id: targetUserId },
      }),
    ]);

    res.json({ message: `User "${targetUser.name}" (${targetUser.email}) removed successfully.` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;