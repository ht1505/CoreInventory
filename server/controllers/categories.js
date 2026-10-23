const prisma = require('../prismaClient');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
};
