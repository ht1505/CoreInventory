const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const receiptRoutes = require('./routes/receipts');
const deliveryRoutes = require('./routes/deliveries');
const transferRoutes = require('./routes/transfers');
const adjustmentRoutes = require('./routes/adjustments');
const ledgerRoutes = require('./routes/ledger');
const dashboardRoutes = require('./routes/dashboard');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const locationRoutes = require('./routes/locations');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const warehouseRoutes = require('./routes/warehouses'); // ← ADDED

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouses', warehouseRoutes); // ← ADDED

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});