# CoreInventory — Software Management System

A full-stack, modular Inventory Management and Warehouse Logistics System developed as an academic software engineering project by a 2-person engineering team.

---

## 📌 Project Overview

**CoreInventory** is designed to solve real-world stock management challenges across multiple warehouses, locations, and suppliers. The system enables real-time inventory tracking, batch operations (receipts, customer deliveries, internal transfers, and physical stock adjustments), automated reorder tracking, an audit ledger, and interactive database exploration.

### Key Architecture Highlights
- **Total Inventory Dataset:** **Exactly 5,000 items** distributed deterministically across 8 industrial categories with realistic SKU nomenclature, specifications, and stock distributions (healthy stock, low-stock warnings, and out-of-stock items).
- **Architecture Pattern:** Decoupled Client-Server Architecture (Next.js 14 App Router + Node.js / Express REST API + Prisma ORM + PostgreSQL).
- **Authentication & RBAC:** Role-Based Access Control supporting `MANAGER` and `STAFF` roles with JWT security.

---

## 👥 Two-Person Team Division of Responsibilities

This project was engineered and maintained by a team of two students. Work is divided along clear module boundaries to facilitate demonstration and code review:

| Member | Primary Focus Area | Key Modules & Deliverables |
| :--- | :--- | :--- |
| **Team Member 1**<br>*(Frontend & UX Lead)* | Client Application, User Interface & State Management | • Next.js App Router UI (`/dashboard`, `/products`, `/ledger`, etc.)<br>• Real-time stock search, multi-criteria filtering, and client pagination (handling 5,000 records smoothly)<br>• Modal forms and client-side validation for operations<br>• Dynamic theme contexts and responsive navigation layout |
| **Team Member 2**<br>*(Backend & Database Lead)* | REST APIs, Database Schema, Business Logic & Seeding | • Express.js REST API routes and business controllers<br>• Prisma ORM data modeling, migrations, and PostgreSQL relations<br>• Idempotent 5,000-item deterministic database seed engine<br>• Stock validation transactions (preventing negative quantities and updating StockLedger) |

---

## 🏗️ System Architecture & Folder Structure

```
CoreInventory-main/
├── client/                     # Frontend Application (Next.js 14 App Router)
│   ├── app/                    # Next.js Pages & Layouts
│   │   ├── auth/               # Authentication views (Login, Signup, OTP)
│   │   ├── dashboard/          # Protected Dashboard routes
│   │   │   ├── adjustments/    # Physical inventory adjustment module
│   │   │   ├── database/       # Live Database Table inspector (Manager only)
│   │   │   ├── deliveries/     # Outgoing customer dispatch module
│   │   │   ├── ledger/         # Stock movement audit trail (Move History)
│   │   │   ├── products/       # Paginated product catalog (5,000 items)
│   │   │   ├── receipts/       # Incoming supplier receipt module
│   │   │   ├── suppliers/      # Supplier management CRUD
│   │   │   ├── transfers/      # Inter-warehouse transfer module
│   │   │   ├── warehouses/     # Warehouse and location hierarchy
│   │   │   └── page.tsx        # KPI Dashboard overview & recent movements
│   │   ├── globals.css         # Global style rules
│   │   ├── layout.tsx          # Root HTML layout
│   │   └── page.tsx            # Redirection entrypoint
│   ├── components/             # Reusable UI Components
│   │   ├── layout/             # Sidebar, Navbar, and Topbar
│   │   ├── ui/                 # Accessible base UI primitives
│   │   └── ChatWidget.tsx      # Inventory Assistant Chatbot widget
│   ├── hooks/                  # Custom React hooks (useAuth, etc.)
│   ├── lib/                    # Axios instance, formatting, style tokens
│   ├── .env.example            # Client environment template
│   └── package.json            # Frontend dependency manifest
│
├── server/                     # Backend API Server (Node.js & Express)
│   ├── controllers/            # Controller layer (Request handling & business logic)
│   │   ├── adjustments.js      # Stock correction controller
│   │   ├── auth.js             # Authentication, password reset & OTP
│   │   ├── categories.js       # Product category controller
│   │   ├── chat.js             # AI Assistant query controller (Groq API)
│   │   ├── dashboard.js        # KPI computation & movement aggregation
│   │   ├── deliveries.js       # Delivery creation & validation transactions
│   │   ├── locations.js        # Warehouse location queries
│   │   ├── products.js         # Catalog queries & product creation
│   │   ├── receipts.js         # Supplier receipt processing & stock increment
│   │   ├── suppliers.js        # Supplier CRUD controller
│   │   ├── transfers.js        # Inter-location stock transfer controller
│   │   └── warehouses.js       # Warehouse CRUD controller
│   ├── middleware/             # Express middlewares (JWT authMiddleware)
│   ├── prisma/                 # Database Schema & Migrations
│   │   ├── migrations/         # PostgreSQL schema migration history
│   │   ├── schema.prisma       # Prisma data models & relations
│   │   └── seed.js             # Deterministic 5,000 item seed generator
│   ├── routes/                 # Express REST API routing endpoints
│   ├── utils/                  # Mailer utility (Nodemailer OTP delivery)
│   ├── .env.example            # Server environment template
│   ├── index.js                # Server entry point & CORS configuration
│   └── package.json            # Backend dependency manifest
│
├── .gitignore                  # Git exclusions for dependencies, builds, & secrets
└── README.md                   # Complete Project Documentation & Demo Guide
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Next.js 14 (App Router), TypeScript, Lucide Icons, React Hot Toast |
| **Backend** | Node.js (v20+), Express.js (v5), Prisma ORM (v5), JWT, bcryptjs |
| **Database** | PostgreSQL (Relational schema with foreign keys, indexes, and constraints) |
| **Tooling** | Nodemailer (OTP emails), Groq SDK (AI Inventory Chatbot) |

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v20.x or v22.x
- **PostgreSQL**: v14, v15, or v16 (Local or Cloud instance e.g. Neon, Supabase, Render, Aiven)
- **Git**

### 2. Environment Configuration

#### A. Backend Setup (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/core_inventory?schema=public"
JWT_SECRET="coreinventory_jwt_secret_academic_demo_key_2026"

# Optional credentials
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_gmail_app_password"
GROQ_API_KEY="gsk_your_groq_key"
```

#### B. Frontend Setup (`client/.env.local`)
Create `client/.env.local` based on `client/.env.example`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

## 🗄️ Database Initialization & 5,000 Items Seed

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   ```

2. Run Prisma migrations to construct all tables:
   ```bash
   npx prisma migrate deploy
   # Or for fresh local database:
   npx prisma db push
   ```

3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Run the deterministic Seeding script:
   ```bash
   npm run seed
   ```

### 📊 Seed Data Summary:
- **Total Products:** **Exactly 5,000 items** across 8 industrial categories:
  - Raw Materials: 800 items
  - Finished Goods: 750 items
  - Packaging Materials: 600 items
  - Spare Parts & Tools: 950 items
  - Electronics & Components: 900 items
  - Chemicals & Solvents: 400 items
  - Safety & Equipment: 350 items
  - Office & Supplies: 250 items
- **Stock Distribution:**
  - Healthy Normal Stock: ~80%
  - Low Stock Warning: ~15%
  - Out of Stock: ~5%
- **Warehouses:** 3 configured facilities with 7 storage locations.
- **Suppliers:** 7 industrial suppliers with registered contacts.
- **Demo Accounts Created:**
  - **Manager Account:** `admin@coreinventory.com` | Password: `admin123`
  - **Staff Account:** `staff@coreinventory.com` | Password: `staff123`

---

## 🚀 Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
# Server will run on: http://localhost:5000
```

### Start the Frontend Client
In a separate terminal window:
```bash
cd client
npm run dev
# Client will run on: http://localhost:3000
```

Open `http://localhost:3000` in your web browser. You will be automatically redirected to `/auth/login`.

---

## 🎯 Live Demonstration Walkthrough

During your evaluation or live demo, follow this guided flow:

1. **Sign In (`/auth/login`):**
   - Enter `admin@coreinventory.com` and `admin123`. Click **Sign in**.
   - Notice the role badge confirms **Manager** privileges.

2. **Executive KPI Dashboard (`/dashboard`):**
   - Highlights live cards for Total Products (5,000), Low Stock count, Out of Stock count, Pending Receipts, and Pending Deliveries.
   - Shows the recent movements table with real-time audit logs.
   - Click any card (e.g., Total Products) to navigate directly to that module.

3. **5,000-Item Catalog & Search (`/dashboard/products`):**
   - Demonstrates smooth client pagination (25 / 50 / 100 items per page).
   - Test the live search bar: type `Copper`, `Titanium`, `Bearing`, or SKU `RAW-0010`.
   - Test category dropdown filtering (e.g. filter by `Electronics & Components`).
   - Test stock status filter (e.g. view all `Low Stock Alert` or `Out of Stock` items).
   - Switch between **Table View** and **Category Groups**.
   - Click **+ New Product** to add an item; notice instant database persistence.

4. **Supplier Receipts (`/dashboard/receipts`):**
   - View pending draft receipt `REC-002`.
   - Click **+ New Receipt** to create a purchase receipt from a supplier into a specific warehouse location.
   - Click **Validate** on a draft receipt; observe stock increment and entry in Move History.

5. **Customer Deliveries (`/dashboard/deliveries`):**
   - View pending delivery `DEL-002`.
   - Click **Validate**; notice stock decrements safely and validation errors trigger if stock is insufficient.

6. **Inter-Warehouse Transfers (`/dashboard/transfers`):**
   - Move inventory from `Central Aisle A` to `Assembly Floor`.
   - Validate the transfer; stock moves seamlessly between locations in a single transaction.

7. **Audit Trail & Move History (`/dashboard/ledger`):**
   - Filter by movement type (`Receipt`, `Delivery`, `Transfer`, `Adjustment`).
   - Every movement records previous stock, quantity change, resultant stock, timestamp, and user.

8. **Database Table Explorer (`/dashboard/database`):**
   - Manager-only inspector to view raw database records across all 10 tables without third-party SQL tools.

---

## 🧪 Testing & Verification Performed

- [x] **Next.js Production Build:** `npm run build` executed and passed with 100% route prerendering and zero type errors.
- [x] **Prisma Client Generation:** Verified model typings and relational integrity.
- [x] **Deterministic Seed:** Verified 5,000 unique records generated across all categories.
- [x] **Relational Integrity:** Verified foreign key references across Products, Categories, Stocks, Locations, and StockLedger.
- [x] **API Endpoints:** Verified routes and controllers for Products, Receipts, Deliveries, Transfers, Adjustments, Suppliers, Locations, Warehouses, and Ledger.
