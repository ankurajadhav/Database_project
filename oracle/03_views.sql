-- ============================================================================
-- SCRIPT 03: DATABASE VIEWS
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- ============================================================================

PROMPT Creating View 1: V_CUSTOMER_PAYMENT_SUMMARY (Report Page 48)
CREATE OR REPLACE VIEW V_CUSTOMER_PAYMENT_SUMMARY AS
SELECT C.CustomerID,
       C.CustomerName,
       COUNT(P.PaymentID) AS PaymentCount,
       NVL(SUM(P.Amount), 0) AS TotalPaid
FROM CUSTOMER C
LEFT JOIN SALE S ON C.CustomerID = S.CustomerID
LEFT JOIN PAYMENT P ON S.SaleID = P.SaleID
GROUP BY C.CustomerID, C.CustomerName
WITH READ ONLY;

PROMPT Creating View 2: V_SALE_DETAILS (Report Page 49)
CREATE OR REPLACE VIEW V_SALE_DETAILS AS
SELECT S.SaleID,
       S.SaleDateTime,
       C.CustomerID,
       C.CustomerName,
       K.ClerkID,
       K.ClerkName,
       S.TaxAmount,
       S.OrderDiscountAmount
FROM SALE S
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
WITH READ ONLY;

PROMPT Creating View 3: V_PRODUCT_INVENTORY_STATUS (Inventory and Reorder Alert View)
CREATE OR REPLACE VIEW V_PRODUCT_INVENTORY_STATUS AS
SELECT P.ProductID,
       P.ProductName,
       P.Barcode,
       C.CategoryName,
       P.SellingPrice,
       P.Unit,
       I.QuantityOnHand,
       I.ReorderLevel,
       CASE 
           WHEN I.QuantityOnHand <= I.ReorderLevel THEN 'REORDER_NOW'
           WHEN I.QuantityOnHand <= I.ReorderLevel * 1.5 THEN 'STOCK_LOW'
           ELSE 'ADEQUATE'
       END AS StockStatus,
       I.LastUpdated
FROM PRODUCT P
JOIN CATEGORY C ON P.CategoryID = C.CategoryID
JOIN INVENTORY I ON P.ProductID = I.ProductID
WITH READ ONLY;

PROMPT Creating View 4: V_SUPPLIER_RECEIPT_SUMMARY (Supplier procurement breakdown)
CREATE OR REPLACE VIEW V_SUPPLIER_RECEIPT_SUMMARY AS
SELECT S.SupplierID,
       S.SupplierName,
       COUNT(R.ReceiptID) AS TotalReceipts,
       COUNT(RI.ReceiptItemID) AS TotalLinesReceived,
       NVL(SUM(RI.QtyReceived * RI.PurchaseUnitCost), 0) AS TotalProcurementValue
FROM SUPPLIER S
LEFT JOIN STOCK_RECEIPT R ON S.SupplierID = R.SupplierID
LEFT JOIN STOCK_RECEIPT_ITEM RI ON R.ReceiptID = RI.ReceiptID
GROUP BY S.SupplierID, S.SupplierName
WITH READ ONLY;

PROMPT Views created successfully.
