# 🎬 CoreInventory — 4 to 5 Minute Product Demo Script (Functional Walkthrough)
> **Goal:** Pure functional demonstration of what every module does from a user's perspective.  
> **Approach:** Zero technical / stack / code jargon. 100% focused on features, operational workflows, and software value.  
> **Format:** 2-Person Conversational Demo (Person 1 & Person 2).  
> **Target Duration:** **4 Minutes 30 Seconds** *(4–5 Minute Window)*.

---

## ⏱️ Module Schedule & Timeline (Total: 4:30)

| Time | Module Demonstrated | Lead Speaker | Screen Action |
| :---: | :--- | :---: | :--- |
| **0:00 – 0:30** | **Introduction & Login (Role Access)** | Person 1 & 2 | Log in at `/auth/login`, show Manager vs Staff access |
| **0:30 – 1:05** | **Executive Dashboard & Live Alerts** | Person 1 | Show 5,000 items, Low-Stock warnings, live movement feed |
| **1:05 – 1:55** | **Product Catalog, Search & Adding Items** | Person 2 | Search, category filtering, stock states, add new product |
| **1:55 – 2:40** | **Supplier Receipts & Customer Deliveries** | Person 1 & 2 | Validate incoming receipt -> Validate outgoing delivery |
| **2:40 – 3:15** | **Inter-Warehouse Transfers & Adjustments** | Person 1 | Move stock between locations + correct stock discrepancies |
| **3:15 – 3:45** | **Move History (Audit Trail)** | Person 2 | Filter audit log, show quantity before, delta, and after |
| **3:45 – 4:15** | **Suppliers, Warehouses & AI Assistant** | Person 1 & 2 | Show facilities list + ask AI chatbot for low-stock advice |
| **4:15 – 4:30** | **Wrap-Up & Conclusion** | Person 1 & 2 | Summary of business benefits & closing sign-off |

---

## 🎬 Full Demonstration Script

---

### [0:00 – 0:30] Introduction & User Access Control

#### 🖥️ Visual Screen Cue
- Open browser at `http://localhost:3000/auth/login`.
- Enter `admin@coreinventory.com` and `admin123`.
- Click **Sign in**. The screen transitions smoothly to `/dashboard`.
- Point mouse to the top-right role badge displaying **Manager**.

#### 🗣️ Spoken Script
- **Person 1 [0:00 – 0:15]:**  
  > *"Hello everyone! Today we are demonstrating **CoreInventory**, an all-in-one inventory and warehouse logistics management system. I am **[Person 1 Name]**, and with me is **[Person 2 Name]**.*  
  > *Let's start right at the login screen."*

- **Person 2 [0:15 – 0:30]:**  
  > *"CoreInventory supports different user roles. Warehouse floor staff can perform daily tasks like receiving shipments and preparing dispatches, while warehouse managers have full administrative oversight, including stock adjustments and supplier onboarding.*  
  > *We'll sign in with the Manager account to explore the entire system."*

---

### [0:30 – 1:05] Executive KPI Dashboard & Real-Time Alerts

#### 🖥️ Visual Screen Cue
- On `/dashboard`, slowly hover over each KPI card:
  1. **Total Products** (showing `5,000`)
  2. **Low Stock Items** (amber warning indicator)
  3. **Out of Stock Items** (red alert indicator)
  4. **Pending Receipts** & **Pending Deliveries**
- Scroll down slightly to showcase the **Recent Movements** table with real-time badges (`RECEIPT`, `DELIVERY`, `TRANSFER`).

#### 🗣️ Spoken Script
- **Person 1 [0:30 – 0:50]:**  
  > *"Once logged in, we land on the **Executive Dashboard**. At a single glance, a warehouse manager can assess the entire facility's operational health.*  
  > *Right at the top, we see our active catalog of 5,000 industrial items, alongside automated alerts for items that have dropped below their minimum reorder point, and critical alerts for out-of-stock items that need immediate reordering."*

- **Person 2 [0:50 – 1:05]:**  
  > *"Below the metrics is the live activity ticker. Every time goods are received, transferred between shelves, or shipped to customers, it is logged right here in real time.*  
  > *Every card is interactive, so clicking on 'Total Products' takes us straight to our catalog."*

---

### [1:05 – 1:55] Product Catalog, Search & Adding New Items

#### 🖥️ Visual Screen Cue
- Navigate to `/dashboard/products`.
- Demonstrate pagination: show 5,000 total items, switch page size to 50, click Next page.
- In the search bar: type `Copper`, clear, then type `RAW-0010`. Results filter instantly.
- Click the Category dropdown: select `Electronics & Components`, then `Spare Parts & Tools`.
- Click Stock Status dropdown: filter by `Low Stock Alert`.
- Click the **+ New Product** button. Fill out the popup form:
  - Name: `Precision Digital Caliper`
  - SKU: `TOOL-9920`
  - Category: `Spare Parts & Tools`
  - Unit Price: `45.00`
  - Initial Stock: `120`
- Click **Save Product**. Show it appearing immediately in the table.

#### 🗣️ Spoken Script
- **Person 2 [1:05 – 1:30]:**  
  > *"This is the **Product Catalog**, housing 5,000 products across 8 industrial categories.*  
  > *Even with 5,000 items, navigation is effortless. As I type 'Copper' or an exact SKU like 'RAW-0010', the table filters instantly.*  
  > *We can also filter by category—such as Electronics or Spare Parts—or isolate all products currently on low-stock alert so procurement teams know what to order next."*

- **Person 1 [1:30 – 1:55]:**  
  > *"Adding new inventory is just as simple. By clicking **+ New Product**, a manager enters the product details, assigns an SKU and category, and sets an initial shelf stock.*  
  > *Once saved, the item is immediately available across all warehouse operations and ready to be received or shipped."*

---

### [1:55 – 2:40] Warehouse Operations: Supplier Receipts & Customer Deliveries

#### 🖥️ Visual Screen Cue
1. **Receipts:**
   - Click **Receipts** (`/dashboard/receipts`) on the sidebar.
   - Click draft receipt `REC-002` from supplier *Acme Industrial Supplies*.
   - Point to the items and quantities arriving into `Central Aisle A`.
   - Click **Validate Receipt**. Show the status tag change to a green **DONE** badge.
2. **Deliveries:**
   - Click **Deliveries** (`/dashboard/deliveries`) on the sidebar.
   - Click draft delivery `DEL-002`.
   - Point to the customer name and requested order quantities.
   - Click **Validate Delivery**. Show the status change to **DONE**.
   - Mention that if stock were insufficient, the system blocks the delivery to prevent negative stock.

#### 🗣️ Spoken Script
- **Person 2 [1:55 – 2:20]:**  
  > *"Now let's look at day-to-day warehouse movements, starting with **Supplier Receipts**.*  
  > *When shipments arrive at the loading bay, staff open the corresponding draft receipt—like `REC-002` here.*  
  > *After physically verifying the boxes, clicking **Validate Receipt** officially books the items into warehouse storage, automatically increasing our on-hand inventory."*

- **Person 1 [2:20 – 2:40]:**  
  > *"On the fulfillment side, we have **Customer Deliveries**.*  
  > *When an order is packed and ready to leave the warehouse, we open the delivery slip and click **Validate Delivery**.*  
  > *The system immediately deducts the items from our shelves. Crucially, the system checks available quantities before dispatching, preventing anyone from shipping stock that doesn't exist."*

---

### [2:40 – 3:15] Internal Transfers & Physical Stock Adjustments

#### 🖥️ Visual Screen Cue
1. **Transfers:**
   - Click **Transfers** (`/dashboard/transfers`) on the sidebar.
   - Show an internal transfer: Moving 25 units of raw material from `Warehouse 1 - Central Aisle A` to `Warehouse 2 - Assembly Floor`.
   - Click **Validate Transfer**.
2. **Adjustments:**
   - Click **Adjustments** (`/dashboard/adjustments`) on the sidebar.
   - Show how a manager performs a physical count adjustment (e.g. correcting a discrepancy from cycle counting).

#### 🗣️ Spoken Script
- **Person 1 [2:40 – 3:00]:**  
  > *"Warehouses constantly relocate goods between staging areas and production lines. With **Inter-Warehouse Transfers**, we can move items between different facilities and sub-locations.*  
  > *When we validate a transfer, the system simultaneously deducts from the origin shelf and adds to the destination shelf so no items are ever lost in transit."*

- **Person 2 [3:00 – 3:15]:**  
  > *"When routine cycle counts reveal broken or misplaced items, the **Adjustments** module allows managers to reconcile recorded numbers with physical shelf counts, keeping our records 100% accurate."*

---

### [3:15 – 3:45] Move History & Audit Trail (The Stock Ledger)

#### 🖥️ Visual Screen Cue
- Click **Move History** (`/dashboard/ledger`) on the sidebar.
- Scroll through the audit log columns: `Date & Time`, `Product SKU`, `Type`, `Source`, `Destination`, `Change Quantity`, `Resulting Stock`, `Reference`, `User`.
- Filter by `Movement Type` -> select `Receipt`, then `Delivery`.
- Point out the exact operations just completed moments ago.

#### 🗣️ Spoken Script
- **Person 2 [3:15 – 3:45]:**  
  > *"Accountability is essential for warehouse management. The **Move History** module is an unbroken audit trail of every single unit that has ever moved through our warehouses.*  
  > *Notice the transparency: every row records the exact timestamp, product SKU, whether it was a receipt or delivery, the quantity changed, the final stock balance, and the exact user who authorized it.*  
  > *Nothing can be deleted or overwritten here, ensuring complete traceability for audits."*

---

### [3:45 – 4:15] Facilities, Suppliers & AI Inventory Assistant

#### 🖥️ Visual Screen Cue
1. **Warehouses & Suppliers:**
   - Quickly click **Warehouses** (`/dashboard/warehouses`) to show the 3 facilities and sub-location hierarchy.
   - Quickly click **Suppliers** (`/dashboard/suppliers`) to show registered vendors.
2. **AI Chatbot:**
   - Click the floating **AI Assistant** icon at the bottom-right corner.
   - In the chat box, type: `"Which items are currently running low on stock and need reordering?"`
   - Show the assistant's clear, intelligent breakdown of low-stock items.

#### 🗣️ Spoken Script
- **Person 1 [3:45 – 4:00]:**  
  > *"Under the management menus, we can configure our physical **Warehouses and Storage Locations**, as well as maintain our active **Suppliers** directory with contact details and terms."*

- **Person 2 [4:00 – 4:15]:**  
  > *"Finally, we've integrated an intelligent **AI Inventory Assistant**.*  
  > *Instead of manually digging through reports, warehouse managers can simply ask plain-English questions—such as 'Which items are low on stock?'—and get immediate, accurate answers based on our live inventory data."*

---

### [4:15 – 4:30] Wrap-Up & Conclusion

#### 🖥️ Visual Screen Cue
- Click back to the main **Executive Dashboard** (`/dashboard`).
- Both presenters deliver the quick sign-off.

#### 🗣️ Spoken Script
- **Person 1 [4:15 – 4:22]:**  
  > *"To wrap up, CoreInventory provides a unified, reliable platform for modern warehouse logistics—from receiving goods and tracking stock levels to fulfilling customer orders with complete audit accountability."*

- **Person 2 [4:22 – 4:30]:**  
  > *"Thank you very much for watching our demonstration. We are now open to any questions!"*

---

## 📋 Quick Teleprompter Card (Keep Open While Recording)

```
[0:00 - 0:15] Person 1: Welcome & introduce CoreInventory
[0:15 - 0:30] Person 2: Explain Manager vs Staff roles & log in
[0:30 - 0:50] Person 1: Dashboard KPIs (5,000 items, low-stock, out-of-stock)
[0:50 - 1:05] Person 2: Live recent activity stream & navigation
[1:05 - 1:30] Person 2: Products catalog (search, categories, low-stock filter)
[1:30 - 1:55] Person 1: Add new product modal & instant availability
[1:55 - 2:20] Person 2: Supplier Receipts (validate draft REC-002 to add stock)
[2:20 - 2:40] Person 1: Customer Deliveries (validate DEL-002, safety check)
[2:40 - 3:00] Person 1: Inter-Warehouse Transfers (move goods between facilities)
[3:00 - 3:15] Person 2: Physical Adjustments (reconcile shelf count discrepancies)
[3:15 - 3:45] Person 2: Move History / Audit Ledger (traceability, before/delta/after)
[3:45 - 4:00] Person 1: Warehouses & Suppliers directory
[4:00 - 4:15] Person 2: AI Assistant (ask for low-stock reorder suggestions)
[4:15 - 4:22] Person 1: Summary of operational benefits
[4:22 - 4:30] Person 2: Thank you & conclusion
```
