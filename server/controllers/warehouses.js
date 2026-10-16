const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { locations: true },
      orderBy: { id: 'asc' },
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) return res.status(400).json({ error: 'Name and address required' });
    const warehouse = await prisma.warehouse.create({ data: { name, address }, include: { locations: true } });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: { name, address },
      include: { locations: true },
    });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.warehouse.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };