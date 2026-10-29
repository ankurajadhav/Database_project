# SMART GROCERY RETAIL MANAGEMENT AND PAYMENT SYSTEM
**University Lab Final Project**  
**Course:** Database Systems (BCSE302P)  
**Student:** Ankur Anil Jadhav (Registration No: 24BDS0162)  
**Evaluator:** Dr. Anand Bihari, School of Computer Science & Engineering, Vellore Institute of Technology (VIT)  
**Database Architecture:** Oracle Database 23ai / 26ai Free (SQL*Plus) + Node.js / Express REST API + React & Tailwind CSS  

---

## 1. System Overview

This project implements a complete, enterprise-grade grocery store retail and payment management application built on an **11-table Third Normal Form (3NF)** relational database schema in Oracle Database.

### Core Architectural Features:
- **11-Table Relational Schema:** Fully implements the conceptual ER diagram including junction tables (`SALE_ITEM`, `STOCK_RECEIPT_ITEM`) and real inventory tracking (`QuantityOnHand`).
- **ACID Transaction Safety:** Atomic POS checkout with row-level locking on inventory (`FOR UPDATE`) to prevent overselling and race conditions under concurrent checkouts.
- **PL/SQL Engine:** Includes stored procedures (`PROC_ADD_LOYALTY_POINTS`, `PROC_UPDATE_PAYMENT_STATUS`, `PROC_RECEIVE_STOCK`), user-defined functions (`FN_CUSTOMER_TOTAL_PAID`, `FN_PRODUCT_PRICE_LEVEL`), triggers (`TRG_INVENTORY_UPDATED`, `TRG_PAYMENT_STATUS_CHECK`), and explicit cursors.
- **Role-Based Security:** Demonstrates common Oracle roles (`C##GROCERY_READ_ROLE`, `C##GROCERY_CASHIER_ROLE`, `C##GROCERY_MANAGER_ROLE`), user grants, revokes, and the Principle of Least Privilege.
- **Indexing & Optimization:** B-tree indexing on `SaleDateTime` with before-and-after `EXPLAIN PLAN` analysis demonstrating avoidance of full table scans.
- **Interactive Lab Console:** Built-in SQL Studio and Test Suite Console for live demonstration and teacher evaluation.

---

## 2. Directory Structure

```text
smart-grocery-system/
├── oracle/                         # Oracle SQL*Plus Scripts
│   ├── 00_environment_check.sql    # Verifies Oracle DB version & container
│   ├── 01_schema.sql               # DDL for all 11 tables with primary/foreign/check keys
│   ├── 02_seed_data.sql            # DML seed data matching report records exactly
│   ├── 03_views.sql                # Analytical views (payment summary, sale details)
│   ├── 04_procedures_functions.sql # PL/SQL procedures and scalar functions
│   ├── 05_triggers_cursors.sql     # Database triggers and explicit PL/SQL cursors
│   ├── 06_security.sql             # Roles, restricted users, grants, least privilege
│   ├── 07_indexes_optimization.sql # Index creation and EXPLAIN PLAN comparisons
│   ├── 08_verification.sql         # Automated row-count and constraint integrity audit
│   ├── 09_demo_queries.sql         # Full SQL suite (A1-A6, B1-B5, C1-C6, D1-D9, CQ01-CQ10)
│   ├── 99_reset_database.sql       # Safe drop script for clean re-runs
│   └── run_all.sql                 # Master batch runner with SPOOL logging
├── src/
│   ├── backend/                    # Node.js / Express REST API and Transaction Engine
│   │   ├── db.ts                   # Authoritative database service and constraint engine
│   │   ├── routes.ts               # REST API endpoints (/api/*)
│   │   └── expressApp.ts           # Express application configuration
│   ├── components/                 # High-Fidelity React UI Components
│   └── types/                      # TypeScript relational contracts & interfaces
├── docs/
│   ├── AUDIT_AND_DESIGN_CHANGE_LOG.md # Design audit, discrepancy list & data dictionary
│   ├── ER_DIAGRAM.md               # Conceptual & relational ER specifications
│   └── VIVA_PREPARATION_GUIDE.md   # Complete answers to all 34 report viva questions
├── server.ts                       # Standalone production Node.js server
├── package.json
└── README.md
```

---

## 3. Windows & Local Execution Instructions

### A. Verifying Oracle & Running SQL*Plus Scripts

1. Open **Windows PowerShell** or Command Prompt.
2. Verify Oracle AI Database 23ai/26ai service is running:
   ```powershell
   Get-Service -Name *Oracle*
   ```
3. Connect to Oracle SQL*Plus:
   ```powershell
   sqlplus system/YourPassword@//localhost:1521/FREE
   ```
4. Navigate to the `oracle` script directory:
   ```sql
   SQL> cd C:\path\to\project\oracle
   ```
5. Execute the master batch script to build the entire schema, populate seed data, compile PL/SQL, and generate test outputs:
   ```sql
   SQL> @run_all.sql
   ```
6. Inspect the generated log file:
   ```powershell
   cat grocery_installation.log
   ```

---

### B. Starting the Application

1. Open a terminal in the project root.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server (runs frontend + Express API on port 3000):
   ```powershell
   npm run dev
   ```
4. Access the application in your browser:
   ```text
   http://localhost:3000
   ```

---

## 4. Live Teacher Demonstration Sequence (10-Minute Walkthrough)

1. **Schema & 3NF Architecture (`/docs/AUDIT_AND_DESIGN_CHANGE_LOG.md`):**
   Show the teacher the 11-table schema, explaining why `SALE_ITEM` and `STOCK_RECEIPT_ITEM` were created to properly resolve many-to-many relationships, and why `QuantityOnHand` was added to `INVENTORY`.
2. **Interactive POS Checkout:**
   Add products to the shopping cart, apply line discounts, select customer `Aarav Sharma` and clerk `Rahul Patil`, record a UPI payment, and complete the sale. Point out how `QuantityOnHand` decreases atomically and loyalty points increase.
3. **Transaction Rollback & Insufficient Stock:**
   Attempt to checkout 100 units of an item with only 5 units in stock. Demonstrate the `ORA-20008` rejection and show that zero database modifications persist.
4. **Interactive SQL Studio:**
   Navigate to the SQL Studio tab in the application. Run `CQ-01`, `CQ-04`, and `G2` (Window functions with LAG/LEAD). View the live tabular outputs and execution timings.
5. **EXPLAIN PLAN Comparison:**
   Show the `EXPLAIN PLAN` comparison between unoptimized `TRUNC(SaleDateTime)` (Full Table Scan) and optimized date range predicate (Index Range Scan).
6. **Automated Test Suite:**
   Run the 15+ automated test cases in the Verification tab. Show green pass statuses confirming referential integrity and security constraints.
