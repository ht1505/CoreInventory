const prisma = require('../prismaClient');

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { locations: true },
      orderBy: { id: 'asc' },
    });
    res.json(warehouses);
  } catch (error) {
    if (next) next(error);
    else res.status(500).json({ error: error.message });
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) return res.status(400).json({ error: 'Name and address required' });
    const warehouse = await prisma.warehouse.create({ data: { name, address }, include: { locations: true } });
    res.status(201).json(warehouse);
  } catch (error) {
    if (next) next(error);
    else res.status(500).json({ error: error.message });
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id, 10) },
      data: { name, address },
      include: { locations: true },
    });
    res.json(warehouse);
  } catch (error) {
    if (next) next(error);
    else res.status(500).json({ error: error.message });
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = parseInt(id, 10);
    const locCount = await prisma.location.count({ where: { warehouseId } });
    if (locCount > 0) {
      return res.status(400).json({ error: `Cannot delete warehouse with ${locCount} active location(s). Please reassign or delete locations first.` });
    }
    await prisma.warehouse.delete({ where: { id: warehouseId } });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete warehouse because associated records exist.' });
    }
    if (next) next(error);
    else res.status(500).json({ error: error.message });
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };