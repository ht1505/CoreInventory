const prisma = require('../prismaClient');

const getAllProducts = async (req, res, next) => {
  try {
    const { selectOnly, search, categoryId } = req.query;

    if (selectOnly === 'true') {
      const products = await prisma.product.findMany({
        select: { id: true, name: true, sku: true },
        orderBy: { name: 'asc' },
      });
      return res.json(products);
    }

    const where = {};
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, categoryId, unit, unitOfMeasure, reorderLevel } = req.body;
    const parsedCategoryId = parseInt(categoryId, 10);
    const parsedReorderLevel = parseInt(reorderLevel, 10) || 0;
    const resolvedUnit = unit || unitOfMeasure || 'units';

    if (!name || !sku || !parsedCategoryId) {
      return res.status(400).json({ error: 'Name, SKU, and Category are required.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId: parsedCategoryId,
        unit: resolvedUnit,
        reorderLevel: parsedReorderLevel,
      },
      include: {
        category: true,
        stocks: true,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, categoryId, unit, unitOfMeasure, reorderLevel } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (sku !== undefined) data.sku = sku;
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId, 10);
    if (unit !== undefined || unitOfMeasure !== undefined) data.unit = unit || unitOfMeasure;
    if (reorderLevel !== undefined) data.reorderLevel = parseInt(reorderLevel, 10);

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data,
      include: {
        category: true,
        stocks: true,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStockProductIds = await prisma.$queryRaw`
      SELECT DISTINCT p.id 
      FROM products p 
      JOIN stocks s ON p.id = s."productId" 
      WHERE s.quantity <= p."reorderLevel"
    `;
    const ids = lowStockProductIds.map(row => row.id);

    const lowStockProducts = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
    });
    res.json(lowStockProducts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  getLowStockProducts,
};
