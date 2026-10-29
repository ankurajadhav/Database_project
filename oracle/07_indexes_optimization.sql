-- ============================================================================
-- SCRIPT 07: INDEXING & QUERY OPTIMIZATION (EXPLAIN PLAN COMPARISON)
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- ============================================================================

PROMPT Step 1: Creating B-Tree Index on SALE(SaleDateTime) (Report Page 69)...
CREATE INDEX IDX_SALE_DATETIME ON SALE (SaleDateTime);

PROMPT Creating Foreign Key & Lookup Indexes for High Concurrency Performance...
CREATE INDEX IDX_SALE_CUSTOMER ON SALE (CustomerID);
CREATE INDEX IDX_SALE_CLERK ON SALE (ClerkID);
CREATE INDEX IDX_SALEITEM_SALE ON SALE_ITEM (SaleID);
CREATE INDEX IDX_SALEITEM_PRODUCT ON SALE_ITEM (ProductID);
CREATE INDEX IDX_PAYMENT_SALE ON PAYMENT (SaleID);
CREATE INDEX IDX_PRODUCT_BARCODE ON PRODUCT (Barcode);

PROMPT Step 2: Generating Unoptimized Query Plan (Function-wrapped predicate)...
EXPLAIN PLAN 
SET STATEMENT_ID = 'SALE_UNOPT' 
FOR 
SELECT SaleID, CustomerID, SaleDateTime 
FROM SALE 
WHERE TRUNC(SaleDateTime) = DATE '2026-01-01';

PROMPT Displaying Unoptimized Execution Plan (TABLE ACCESS FULL expected due to TRUNC()):
SELECT PLAN_TABLE_OUTPUT 
FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, 'SALE_UNOPT', 'TYPICAL'));

PROMPT Step 3: Generating Optimized Query Plan (Sargable Range Predicate)...
EXPLAIN PLAN 
SET STATEMENT_ID = 'SALE_OPT' 
FOR 
SELECT SaleID, CustomerID, SaleDateTime 
FROM SALE 
WHERE SaleDateTime >= DATE '2026-01-01' 
  AND SaleDateTime < DATE '2026-01-02';

PROMPT Displaying Optimized Execution Plan (RANGE SCAN enabled):
SELECT PLAN_TABLE_OUTPUT 
FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, 'SALE_OPT', 'TYPICAL'));

PROMPT Step 4: Verifying Indexes in USER_INDEXES (Report Page 71)...
SELECT INDEX_NAME, TABLE_NAME, STATUS, UNIQUENESS
FROM USER_INDEXES 
WHERE TABLE_NAME IN ('SALE', 'SALE_ITEM', 'PRODUCT', 'PAYMENT', 'INVENTORY')
ORDER BY TABLE_NAME, INDEX_NAME;
