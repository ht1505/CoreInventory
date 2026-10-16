const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CoreInventory Database Seed...');

  // 1. Clean existing records in relational order for idempotency
  console.log('🧹 Cleaning old records...');
  await prisma.stockLedger.deleteMany({});
  await prisma.receiptLine.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.deliveryLine.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.transferLine.deleteMany({});
  await prisma.transfer.deleteMany({});
  await prisma.adjustmentLine.deleteMany({});
  await prisma.adjustment.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log('👤 Seeding default users...');
  const managerPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const managerUser = await prisma.user.create({
    data: {
      name: 'Demo Manager',
      email: 'admin@coreinventory.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Demo Staff',
      email: 'staff@coreinventory.com',
      passwordHash: staffPassword,
      role: 'STAFF',
    },
  });

  // 3. Seed Warehouses
  console.log('🏢 Seeding warehouses & locations...');
  const mainWarehouse = await prisma.warehouse.create({
    data: { name: 'Main Distribution Hub', address: 'Plot 101, Industrial Corridor, Ahmedabad' },
  });
  const logisticsWarehouse = await prisma.warehouse.create({
    data: { name: 'West Regional Depot', address: 'Plot 42, Logistics Park, Sanand' },
  });
  const coldStorageWarehouse = await prisma.warehouse.create({
    data: { name: 'Apex Cold Storage Facility', address: 'Plot 8, Refrigeration SEZ, Gandhinagar' },
  });

  // 4. Seed Locations
  const locA = await prisma.location.create({ data: { name: 'Central Aisle A', warehouseId: mainWarehouse.id } });
  const locB = await prisma.location.create({ data: { name: 'Central Aisle B', warehouseId: mainWarehouse.id } });
  const locAssembly = await prisma.location.create({ data: { name: 'Assembly Floor', warehouseId: mainWarehouse.id } });
  const locDispatch = await prisma.location.create({ data: { name: 'Dispatch Bay', warehouseId: mainWarehouse.id } });
  const locDepot1 = await prisma.location.create({ data: { name: 'Depot Rack C', warehouseId: logisticsWarehouse.id } });
  const locDepot2 = await prisma.location.create({ data: { name: 'Depot Rack D', warehouseId: logisticsWarehouse.id } });
  const locCold = await prisma.location.create({ data: { name: 'Cold Vault 1', warehouseId: coldStorageWarehouse.id } });

  const allLocations = [locA, locB, locAssembly, locDispatch, locDepot1, locDepot2, locCold];

  // 5. Seed Suppliers
  console.log('🚚 Seeding industrial suppliers...');
  const suppliersData = [
    { name: 'Apex Metal & Alloys Corp', contact: '+91 98250 11223' },
    { name: 'National Industrial Supplies', contact: '+91 98980 44556' },
    { name: 'Precision Parts & Fasteners Ltd', contact: '+91 97230 77889' },
    { name: 'PolyPack Containers India', contact: '+91 99040 12345' },
    { name: 'Voltix Electronics Components', contact: '+91 98760 98765' },
    { name: 'ChemSource Synthetics Ltd', contact: '+91 99130 54321' },
    { name: 'SafeWork Equipments & Gear', contact: '+91 98240 67890' },
  ];

  const suppliers = [];
  for (const s of suppliersData) {
    const created = await prisma.supplier.create({ data: s });
    suppliers.push(created);
  }

  // 6. Seed Categories
  console.log('🏷️ Seeding categories...');
  const categoryDefs = [
    { name: 'Raw Materials', count: 800, prefix: 'RAW', unit: 'kg', reorder: 25 },
    { name: 'Finished Goods', count: 750, prefix: 'FNG', unit: 'units', reorder: 10 },
    { name: 'Packaging Materials', count: 600, prefix: 'PKG', unit: 'units', reorder: 50 },
    { name: 'Spare Parts & Tools', count: 950, prefix: 'SPR', unit: 'units', reorder: 20 },
    { name: 'Electronics & Components', count: 900, prefix: 'ELC', unit: 'units', reorder: 15 },
    { name: 'Chemicals & Solvents', count: 400, prefix: 'CHM', unit: 'liters', reorder: 30 },
    { name: 'Safety & Equipment', count: 350, prefix: 'SFT', unit: 'units', reorder: 12 },
    { name: 'Office & Supplies', count: 250, prefix: 'OFC', unit: 'packs', reorder: 15 },
  ];

  // Total check: 800 + 750 + 600 + 950 + 900 + 400 + 350 + 250 = 5,000 items

  const categories = [];
  for (const c of categoryDefs) {
    const cat = await prisma.category.create({ data: { name: c.name } });
    categories.push({ ...cat, ...c });
  }

  // Realistic naming templates
  const itemNouns = {
    RAW: ['Steel Rod', 'Aluminum Bar', 'Copper Wire', 'Brass Ingot', 'Iron Plate', 'Titanium Sheet', 'Nickel Strip', 'Zinc Alloy Bar'],
    FNG: ['Office Ergonomic Chair', 'Modular Work Desk', 'Steel Filing Cabinet', 'Industrial Toolbench', 'Warehouse Storage Rack', 'Precision Assembly Table'],
    PKG: ['Corrugated Heavy Box', 'Stretch Film Roll', 'Bubble Cushion Wrap', 'Reinforced Strapping Tape', 'Kraft Paper Bag', 'Poly Courier Pouch'],
    SPR: ['High-Torque Hex Bolt', 'Radial Ball Bearing', 'Neoprene O-Ring Seal', 'Industrial Timing Belt', 'Flanged Drive Pulley', 'Carbide Drill Bit'],
    ELC: ['Microcontroller Module', 'DC Brushless Motor 24V', 'Digital Opto-Sensor', 'Linear Power Supply 12V', 'Circuit Switch Relay', 'Capacitor Bank 470uF'],
    CHM: ['Industrial Degreaser Solvent', 'Synthetic Machine Lubricant', 'Rust Inhibitor Primer', 'Epoxy Hardener Resin', 'Thermal Conductive Paste'],
    SFT: ['Reinforced Safety Helmet', 'Kevlar Heat-Resistant Gloves', 'High-Visibility Vest', 'Steel-Toe Protective Boots', 'Full-Face Respirator Mask'],
    OFC: ['Premium Copier Paper A4', 'Heavy-Duty Stapler Set', 'Permanent Marker Pack', 'Desk Document Organiser', 'Archival Binder Folder'],
  };

  const grades = ['Standard', 'Commercial', 'Heavy-Duty', 'Precision', 'High-Strength', 'Grade A', 'Industrial', 'Pro-Series'];
  const specs = ['10mm', '15mm', '20mm', '25mm', '50mm', '100mm', 'Type-I', 'Type-II', 'XL', 'Standard Size', 'Series-3', 'Model-X'];

  console.log('📦 Generating exactly 5,000 realistic products...');

  const productsToInsert = [];
  let globalCount = 0;

  for (const cat of categories) {
    const nouns = itemNouns[cat.prefix] || ['Item'];
    for (let i = 1; i <= cat.count; i++) {
      globalCount++;
      const noun = nouns[(i - 1) % nouns.length];
      const grade = grades[(i + 3) % grades.length];
      const spec = specs[(i * 7) % specs.length];
      const seq = String(i).padStart(4, '0');

      const name = `${grade} ${noun} ${spec} #${seq}`;
      const sku = `${cat.prefix}-${seq}`;

      productsToInsert.push({
        name,
        sku,
        categoryId: cat.id,
        unit: cat.unit,
        reorderLevel: cat.reorder,
      });
    }
  }

  console.log(`✨ Total products prepared: ${productsToInsert.length}`);

  // Insert in batches of 1,000 for maximum PostgreSQL efficiency
  const batchSize = 1000;
  for (let b = 0; b < productsToInsert.length; b += batchSize) {
    const chunk = productsToInsert.slice(b, b + batchSize);
    await prisma.product.createMany({ data: chunk });
    console.log(`   Inserted ${b + chunk.length} / ${productsToInsert.length} products...`);
  }

  // Retrieve all products with their IDs to create associated Stock records
  console.log('📊 Creating stock records for all 5,000 items...');
  const allCreatedProducts = await prisma.product.findMany({
    select: { id: true, categoryId: true, reorderLevel: true },
    orderBy: { id: 'asc' },
  });

  const stocksToInsert = [];

  for (let idx = 0; idx < allCreatedProducts.length; idx++) {
    const p = allCreatedProducts[idx];
    const loc = allLocations[idx % allLocations.length];

    // Realistic stock distribution:
    // ~5% out of stock (quantity = 0)
    // ~15% low stock (quantity <= reorderLevel)
    // ~80% normal stock (quantity between reorderLevel * 2 and reorderLevel * 10)
    let quantity = 0;
    const mode = idx % 20;

    if (mode === 0) {
      // Out of stock
      quantity = 0;
    } else if (mode <= 3) {
      // Low stock (e.g. 1 to reorderLevel)
      quantity = Math.max(1, Math.floor(p.reorderLevel * 0.5));
    } else {
      // Normal healthy stock
      quantity = p.reorderLevel * 2 + (idx % 120);
    }

    stocksToInsert.push({
      productId: p.id,
      locationId: loc.id,
      quantity,
    });
  }

  for (let b = 0; b < stocksToInsert.length; b += batchSize) {
    const chunk = stocksToInsert.slice(b, b + batchSize);
    await prisma.stock.createMany({ data: chunk });
    console.log(`   Linked ${b + chunk.length} / ${stocksToInsert.length} stock records...`);
  }

  // 7. Seed Sample Live Demonstration Operations
  console.log('📋 Seeding sample receipts, deliveries, and audit trails...');

  // Sample Receipt (DONE)
  const rec1 = await prisma.receipt.create({
    data: {
      reference: 'REC-001',
      supplierId: suppliers[0].id,
      locationId: locA.id,
      status: 'DONE',
      createdById: managerUser.id,
      validatedAt: new Date(),
      lines: {
        create: [
          { productId: allCreatedProducts[0].id, expectedQty: 100, receivedQty: 100 },
          { productId: allCreatedProducts[1].id, expectedQty: 80, receivedQty: 80 },
        ],
      },
    },
  });

  // Sample Receipt (DRAFT ready for demonstration in UI)
  await prisma.receipt.create({
    data: {
      reference: 'REC-002',
      supplierId: suppliers[1].id,
      locationId: locB.id,
      status: 'DRAFT',
      createdById: managerUser.id,
      lines: {
        create: [
          { productId: allCreatedProducts[10].id, expectedQty: 50, receivedQty: null },
          { productId: allCreatedProducts[11].id, expectedQty: 25, receivedQty: null },
        ],
      },
    },
  });

  // Sample Delivery (DONE)
  await prisma.delivery.create({
    data: {
      reference: 'DEL-001',
      locationId: locDispatch.id,
      customerName: 'Tata Motors Assembly Plant',
      status: 'DONE',
      createdById: managerUser.id,
      validatedAt: new Date(),
      lines: {
        create: [
          { productId: allCreatedProducts[2].id, orderedQty: 15, deliveredQty: 15 },
        ],
      },
    },
  });

  // Sample Delivery (DRAFT ready for validation in demo)
  await prisma.delivery.create({
    data: {
      reference: 'DEL-002',
      locationId: locA.id,
      customerName: 'Reliance Retail Logistics',
      status: 'DRAFT',
      createdById: managerUser.id,
      lines: {
        create: [
          { productId: allCreatedProducts[3].id, orderedQty: 5, deliveredQty: null },
        ],
      },
    },
  });

  // Sample Transfer (DRAFT ready for demonstration)
  await prisma.transfer.create({
    data: {
      reference: 'TRF-001',
      fromLocationId: locA.id,
      toLocationId: locAssembly.id,
      status: 'DRAFT',
      createdById: managerUser.id,
      lines: {
        create: [
          { productId: allCreatedProducts[4].id, quantity: 10 },
        ],
      },
    },
  });

  // Sample Adjustment (DONE)
  await prisma.adjustment.create({
    data: {
      reference: 'ADJ-001',
      locationId: locA.id,
      reason: 'Annual Physical Inventory Audit',
      status: 'DONE',
      createdById: managerUser.id,
      validatedAt: new Date(),
      lines: {
        create: [
          { productId: allCreatedProducts[0].id, recordedQty: 105, actualQty: 100 },
        ],
      },
    },
  });

  // Seed Stock Ledger entries
  const ledgerEntries = [
    {
      productId: allCreatedProducts[0].id,
      locationId: locA.id,
      movementType: 'RECEIPT',
      reference: 'REC-001',
      quantityChange: 100,
      quantityAfter: 100,
      createdById: managerUser.id,
    },
    {
      productId: allCreatedProducts[1].id,
      locationId: locA.id,
      movementType: 'RECEIPT',
      reference: 'REC-001',
      quantityChange: 80,
      quantityAfter: 80,
      createdById: managerUser.id,
    },
    {
      productId: allCreatedProducts[2].id,
      locationId: locDispatch.id,
      movementType: 'DELIVERY',
      reference: 'DEL-001',
      quantityChange: -15,
      quantityAfter: 85,
      createdById: managerUser.id,
    },
    {
      productId: allCreatedProducts[0].id,
      locationId: locA.id,
      movementType: 'ADJUSTMENT',
      reference: 'ADJ-001',
      quantityChange: -5,
      quantityAfter: 100,
      createdById: managerUser.id,
    },
  ];

  for (const entry of ledgerEntries) {
    await prisma.stockLedger.create({ data: entry });
  }

  console.log('✅ Seed successfully completed!');
  console.log('📦 Total inventory items in database: EXACTLY 5,000');
  console.log('👤 Manager account: admin@coreinventory.com / admin123');
  console.log('👤 Staff account:   staff@coreinventory.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });