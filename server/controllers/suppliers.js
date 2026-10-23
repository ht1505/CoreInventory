const prisma = require('../prismaClient');

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { receipts: true },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const { name, contact } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required.' });
    }
    const supplier = await prisma.supplier.create({
      data: { name, contact },
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id, 10) },
      data: { name, contact },
    });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplierId = parseInt(id, 10);

    const receiptCount = await prisma.receipt.count({
      where: { supplierId },
    });
    if (receiptCount > 0) {
      return res.status(400).json({
        error: `Cannot delete supplier because ${receiptCount} receipt(s) are associated with them.`,
      });
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete supplier because receipts or other records are associated with this supplier.',
      });
    }
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
