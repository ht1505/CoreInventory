const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    await prisma.supplier.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
