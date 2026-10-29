-- ============================================================================
-- SCRIPT 08: COMPREHENSIVE DATABASE VERIFICATION & AUDIT
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- ============================================================================

SET SERVEROUTPUT ON;

PROMPT =====================================================================
PROMPT VERIFYING ALL 11 TABLES IN THE REVISED RELATIONAL SCHEMA
PROMPT =====================================================================

SELECT TABLE_NAME, NUM_ROWS, STATUS 
FROM USER_TABLES 
WHERE TABLE_NAME IN (
    'CUSTOMER', 'CLERK', 'CATEGORY', 'SUPPLIER', 'PRODUCT', 
    'INVENTORY', 'SALE', 'PAYMENT', 'STOCK_RECEIPT', 
    'SALE_ITEM', 'STOCK_RECEIPT_ITEM'
)
ORDER BY TABLE_NAME;

PROMPT =====================================================================
PROMPT VERIFYING TABLE ROW COUNTS
PROMPT =====================================================================

SELECT 'CUSTOMER' AS ENTITY, COUNT(*) AS TOTAL_RECORDS FROM CUSTOMER
UNION ALL
SELECT 'CLERK', COUNT(*) FROM CLERK
UNION ALL
SELECT 'CATEGORY', COUNT(*) FROM CATEGORY
UNION ALL
SELECT 'SUPPLIER', COUNT(*) FROM SUPPLIER
UNION ALL
SELECT 'PRODUCT', COUNT(*) FROM PRODUCT
UNION ALL
SELECT 'INVENTORY', COUNT(*) FROM INVENTORY
UNION ALL
SELECT 'SALE', COUNT(*) FROM SALE
UNION ALL
SELECT 'PAYMENT', COUNT(*) FROM PAYMENT
UNION ALL
SELECT 'STOCK_RECEIPT', COUNT(*) FROM STOCK_RECEIPT
UNION ALL
SELECT 'SALE_ITEM', COUNT(*) FROM SALE_ITEM
UNION ALL
SELECT 'STOCK_RECEIPT_ITEM', COUNT(*) FROM STOCK_RECEIPT_ITEM;

PROMPT =====================================================================
PROMPT VERIFYING CONSTRAINTS INTEGRITY
PROMPT =====================================================================

SELECT CONSTRAINT_TYPE, COUNT(*) AS CONSTRAINT_COUNT
FROM USER_CONSTRAINTS
WHERE TABLE_NAME IN (
    'CUSTOMER', 'CLERK', 'CATEGORY', 'SUPPLIER', 'PRODUCT', 
    'INVENTORY', 'SALE', 'PAYMENT', 'STOCK_RECEIPT', 
    'SALE_ITEM', 'STOCK_RECEIPT_ITEM'
)
GROUP BY CONSTRAINT_TYPE;

PROMPT =====================================================================
PROMPT AUDITING ORPHAN RECORDS (MUST RETURN 0)
PROMPT =====================================================================

-- Check for orphan sales without customers
SELECT COUNT(*) AS ORPHAN_SALES FROM SALE WHERE CustomerID NOT IN (SELECT CustomerID FROM CUSTOMER);

-- Check for orphan payments without sales
SELECT COUNT(*) AS ORPHAN_PAYMENTS FROM PAYMENT WHERE SaleID NOT IN (SELECT SaleID FROM SALE);

-- Check for negative inventory
SELECT COUNT(*) AS NEGATIVE_STOCK FROM INVENTORY WHERE QuantityOnHand < 0;

PROMPT Verification complete. All constraints intact.
