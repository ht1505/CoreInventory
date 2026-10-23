const prisma = require('../prismaClient');

const getAllLocations = async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        warehouse: true,
      },
      orderBy: { id: 'asc' },
    });
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLocations,
};
