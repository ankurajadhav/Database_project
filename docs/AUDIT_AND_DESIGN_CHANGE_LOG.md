# AUDIT, DISCREPANCY LIST & DESIGN CHANGE LOG
**Project:** Smart Grocery Retail Management and Payment System  
**Subject:** Database Systems (BCSE302P) - Lab Project  
**Student:** Ankur Anil Jadhav (Reg. No: 24BDS0162)  
**Evaluator:** Dr. Anand Bihari, School of Computer Science & Engineering, VIT  
**Database Target:** Oracle Database (SQL*Plus 23ai / 26ai Free)  

---

## 1. Initial Design Audit & Discrepancy List

An audit of the original report, ER diagram, and initial 9-table SQL DDL revealed three critical structural discrepancies that required resolution for true relational correctness:

| # | Component | Original Report / Diagram | Discrepancy / Problem | Corrected Implementation in Final Schema |
|---|---|---|---|---|
| 1 | **M:N CONTAINS Relationship (Sale to Product)** | ER diagram shows M:N relationship `CONTAINS` with attributes `QuantitySold`, `UnitPriceAtSale`, `LineDiscount`. However, original SQL only had 9 tables, missing a junction table. | Without a junction table, a sale could not contain multiple products without violating 1NF (repeating groups) or losing historical transaction prices. | Created **`SALE_ITEM`** table (Table 10) with composite candidate key `(SaleID, ProductID)` and surrogate PK `SaleItemID`. Preserves historical `UnitPriceAtSale` and individual `LineDiscount`. |
| 2 | **M:N INCLUDES Relationship (Stock Receipt to Product)** | ER diagram shows M:N relationship `INCLUDES` with attributes `QtyReceived`, `PurchaseUnitCost`. Original SQL had no junction table. | Without a junction table, a supplier stock receipt could not accept multiple received items or record per-line purchase costs. | Created **`STOCK_RECEIPT_ITEM`** table (Table 11) with foreign keys to `STOCK_RECEIPT` and `PRODUCT`, storing `QtyReceived` and `PurchaseUnitCost`. |
| 3 | **Inventory Quantity Attribute** | Original `INVENTORY` table only had `InventoryID`, `ProductID`, `ReorderLevel`, and `LastUpdated`, but lacked an on-hand quantity column! | Without an on-hand quantity, stock availability could not be checked during checkout, nor updated upon receipt. | Added **`QuantityOnHand NUMBER(10) DEFAULT 0 NOT NULL`** with `CHECK (QuantityOnHand >= 0)` to `INVENTORY`. 1:1 relationship with `PRODUCT` is strictly preserved via `UNIQUE(ProductID)`. |
| 4 | **Derived Attributes** | `Subtotal`, `TotalAmount` on `SALE` and `TotalCost` on `STOCK_RECEIPT` are drawn with dashed ovals in the ER diagram. | Storing derived amounts in tables leads to update anomalies if items change. | Treated as dynamically computed derived values from persisted `SALE_ITEM` lines, order discounts, and taxes. |

---

## 2. Final Relational Schema Architecture (11 Tables in 3NF)

The finalized database contains **11 tables**, representing every entity and relationship from the ER diagram:

1. **`CUSTOMER`** (CustomerID [PK], CustomerName, CustomerEmail, CustomerPhone, LoyaltyPoints)
2. **`CLERK`** (ClerkID [PK], ClerkName, ClerkEmail, ClerkPhone, Shift)
3. **`CATEGORY`** (CategoryID [PK], CategoryName)
4. **`SUPPLIER`** (SupplierID [PK], SupplierName, SupplierPhone, SupplierEmail)
5. **`PRODUCT`** (ProductID [PK], ProductName, Barcode, SellingPrice, Unit, CategoryID [FK])
6. **`INVENTORY`** (InventoryID [PK], ProductID [FK, UNIQUE], QuantityOnHand, ReorderLevel, LastUpdated)
7. **`SALE`** (SaleID [PK], SaleDateTime, TaxAmount, OrderDiscountAmount, CustomerID [FK], ClerkID [FK])
8. **`PAYMENT`** (PaymentID [PK], Amount, PaymentMethod, PaymentStatus, TransactionRef, PaymentDateTime, SaleID [FK])
9. **`STOCK_RECEIPT`** (ReceiptID [PK], ReceiptDate, ReceiptStatus, SupplierID [FK])
10. **`SALE_ITEM`** (SaleItemID [PK], SaleID [FK], ProductID [FK], QuantitySold, UnitPriceAtSale, LineDiscount)
11. **`STOCK_RECEIPT_ITEM`** (ReceiptItemID [PK], ReceiptID [FK], ProductID [FK], QtyReceived, PurchaseUnitCost)

---

## 3. Comprehensive Data Dictionary

### Table 1: CUSTOMER
Stores registered shoppers, contact details, and earned loyalty balance.
- `CustomerID` NUMBER(10) PRIMARY KEY
- `CustomerName` VARCHAR2(100) NOT NULL
- `CustomerEmail` VARCHAR2(150)
- `CustomerPhone` VARCHAR2(15)
- `LoyaltyPoints` NUMBER(10) DEFAULT 0 NOT NULL CHECK (LoyaltyPoints >= 0)

### Table 2: CLERK
Stores store employees handling registers and stocking.
- `ClerkID` NUMBER(10) PRIMARY KEY
- `ClerkName` VARCHAR2(100) NOT NULL
- `ClerkEmail` VARCHAR2(150)
- `ClerkPhone` VARCHAR2(15)
- `Shift` VARCHAR2(30) (Morning, Evening, Night)

### Table 3: CATEGORY
Product classifications.
- `CategoryID` NUMBER(10) PRIMARY KEY
- `CategoryName` VARCHAR2(100) NOT NULL

### Table 4: SUPPLIER
Wholesale grocery vendors.
- `SupplierID` NUMBER(10) PRIMARY KEY
- `SupplierName` VARCHAR2(100) NOT NULL
- `SupplierPhone` VARCHAR2(15)
- `SupplierEmail` VARCHAR2(150)

### Table 5: PRODUCT
Retail item catalog with current selling prices.
- `ProductID` NUMBER(10) PRIMARY KEY
- `ProductName` VARCHAR2(150) NOT NULL
- `Barcode` VARCHAR2(50)
- `SellingPrice` NUMBER(10,2) NOT NULL CHECK (SellingPrice >= 0)
- `Unit` VARCHAR2(30) NOT NULL (kg, litre, packet, bottle)
- `CategoryID` NUMBER(10) NOT NULL REFERENCES CATEGORY(CategoryID)

### Table 6: INVENTORY
One-to-one stock monitoring record for each active product.
- `InventoryID` NUMBER(10) PRIMARY KEY
- `ProductID` NUMBER(10) NOT NULL UNIQUE REFERENCES PRODUCT(ProductID)
- `QuantityOnHand` NUMBER(10) DEFAULT 0 NOT NULL CHECK (QuantityOnHand >= 0)
- `ReorderLevel` NUMBER(10) DEFAULT 0 NOT NULL CHECK (ReorderLevel >= 0)
- `LastUpdated` DATE DEFAULT SYSDATE NOT NULL

### Table 7: SALE
Master sales transaction header.
- `SaleID` NUMBER(10) PRIMARY KEY
- `SaleDateTime` DATE DEFAULT SYSDATE NOT NULL
- `TaxAmount` NUMBER(10,2) DEFAULT 0 NOT NULL CHECK (TaxAmount >= 0)
- `OrderDiscountAmount` NUMBER(10,2) DEFAULT 0 NOT NULL CHECK (OrderDiscountAmount >= 0)
- `CustomerID` NUMBER(10) NOT NULL REFERENCES CUSTOMER(CustomerID)
- `ClerkID` NUMBER(10) NOT NULL REFERENCES CLERK(ClerkID)

### Table 8: PAYMENT
Tender payments settling sales transactions.
- `PaymentID` NUMBER(10) PRIMARY KEY
- `Amount` NUMBER(10,2) NOT NULL CHECK (Amount > 0)
- `PaymentMethod` VARCHAR2(30) NOT NULL (Cash, Card, UPI)
- `PaymentStatus` VARCHAR2(30) NOT NULL (Pending, Completed, Failed, Refunded)
- `TransactionRef` VARCHAR2(100)
- `PaymentDateTime` DATE DEFAULT SYSDATE NOT NULL
- `SaleID` NUMBER(10) NOT NULL REFERENCES SALE(SaleID)

### Table 9: STOCK_RECEIPT
Inbound vendor shipment header.
- `ReceiptID` NUMBER(10) PRIMARY KEY
- `ReceiptDate` DATE DEFAULT SYSDATE NOT NULL
- `ReceiptStatus` VARCHAR2(30) NOT NULL (Received, Pending, Cancelled)
- `SupplierID` NUMBER(10) NOT NULL REFERENCES SUPPLIER(SupplierID)

### Table 10: SALE_ITEM
Junction table resolving M:N relationship `CONTAINS` between `SALE` and `PRODUCT`.
- `SaleItemID` NUMBER(10) PRIMARY KEY
- `SaleID` NUMBER(10) NOT NULL REFERENCES SALE(SaleID) ON DELETE CASCADE
- `ProductID` NUMBER(10) NOT NULL REFERENCES PRODUCT(ProductID)
- `QuantitySold` NUMBER(10) NOT NULL CHECK (QuantitySold > 0)
- `UnitPriceAtSale` NUMBER(10,2) NOT NULL CHECK (UnitPriceAtSale >= 0)
- `LineDiscount` NUMBER(10,2) DEFAULT 0 NOT NULL CHECK (LineDiscount >= 0)
- Constraint: `UNIQUE (SaleID, ProductID)` prevents duplicate line items for the same product in a single receipt.

### Table 11: STOCK_RECEIPT_ITEM
Junction table resolving M:N relationship `INCLUDES` between `STOCK_RECEIPT` and `PRODUCT`.
- `ReceiptItemID` NUMBER(10) PRIMARY KEY
- `ReceiptID` NUMBER(10) NOT NULL REFERENCES STOCK_RECEIPT(ReceiptID) ON DELETE CASCADE
- `ProductID` NUMBER(10) NOT NULL REFERENCES PRODUCT(ProductID)
- `QtyReceived` NUMBER(10) NOT NULL CHECK (QtyReceived > 0)
- `PurchaseUnitCost` NUMBER(10,2) NOT NULL CHECK (PurchaseUnitCost >= 0)
- Constraint: `UNIQUE (ReceiptID, ProductID)`
