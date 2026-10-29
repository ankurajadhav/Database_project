# ENTITY-RELATIONSHIP (ER) DIAGRAM & RELATIONAL MAPPING
**Project:** Smart Grocery Retail Management and Payment System  
**Course:** Database Systems (BCSE302P) - Lab Project  
**Student:** Ankur Anil Jadhav (24BDS0162)  
**Evaluator:** Dr. Anand Bihari, VIT  

---

## 1. Conceptual ER Diagram Description

```
 [CUSTOMER] (1) ---------<MAKES>---------> (N) [SALE] (1) ---------<HAS PAYMENT>---------> (N) [PAYMENT]
     |                                             |
     |                                             | (N)
     |                                             |
     |                                         <CONTAINS>
     |                                         (QuantitySold, UnitPriceAtSale, LineDiscount)
     |                                             |
     |                                             | (M)
 [CLERK] (1) ------------<PROCESSES>-----> (N) [PRODUCT] (1) ---------<CLASSIFIES>-------- (1) [CATEGORY]
                                                   |
                                                   | (1)
                                               <HAS STOCK>
                                                   |
                                                   | (1, UNIQUE)
                                               [INVENTORY] (QuantityOnHand, ReorderLevel, LastUpdated)
                                                   |
                                                   | (M)
                                               <INCLUDES>
                                               (QtyReceived, PurchaseUnitCost)
                                                   |
                                                   | (N)
 [SUPPLIER] (1) ----------<PROVIDES>-----> (N) [STOCK_RECEIPT]
```

---

## 2. Cardinalities and Foreign Key Mappings

1. **CUSTOMER (1) to SALE (N)**:
   - One customer makes zero, one, or many sales.
   - Each sale references exactly one customer.
   - Implemented via `SALE.CustomerID REFERENCES CUSTOMER(CustomerID)`.

2. **CLERK (1) to SALE (N)**:
   - One clerk processes zero, one, or many sales.
   - Each sale is recorded by one clerk.
   - Implemented via `SALE.ClerkID REFERENCES CLERK(ClerkID)`.

3. **SALE (1) to PAYMENT (N)**:
   - One sale may have multiple partial payments or settle in one lump sum.
   - Each payment belongs to exactly one sale.
   - Implemented via `PAYMENT.SaleID REFERENCES SALE(SaleID)`.

4. **CATEGORY (1) to PRODUCT (N)**:
   - One category classifies multiple retail products.
   - Each product belongs to one category.
   - Implemented via `PRODUCT.CategoryID REFERENCES CATEGORY(CategoryID)`.

5. **PRODUCT (1) to INVENTORY (1)**:
   - One-to-one relationship. Every active product has exactly one inventory monitoring record.
   - Implemented via `INVENTORY.ProductID REFERENCES PRODUCT(ProductID)` with `UNIQUE(ProductID)`.
   - On-hand stock column `QuantityOnHand` added to track real stock movements.

6. **SUPPLIER (1) to STOCK_RECEIPT (N)**:
   - One supplier provides multiple stock receipts over time.
   - Each receipt belongs to one supplier.
   - Implemented via `STOCK_RECEIPT.SupplierID REFERENCES SUPPLIER(SupplierID)`.

7. **SALE (M) to PRODUCT (N) — Junction Table `SALE_ITEM`**:
   - Resolves the many-to-many `CONTAINS` relationship.
   - Stores relationship attributes: `QuantitySold`, `UnitPriceAtSale`, `LineDiscount`.
   - `UnitPriceAtSale` preserves the historical price charged during checkout.
   - `UNIQUE(SaleID, ProductID)` prevents duplicate rows for the same product in a single receipt.

8. **STOCK_RECEIPT (M) to PRODUCT (N) — Junction Table `STOCK_RECEIPT_ITEM`**:
   - Resolves the many-to-many `INCLUDES` relationship.
   - Stores relationship attributes: `QtyReceived`, `PurchaseUnitCost`.
   - Foreign keys reference `STOCK_RECEIPT(ReceiptID)` and `PRODUCT(ProductID)`.
