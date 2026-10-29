-- ============================================================================
-- SCRIPT 02: DML SEED DATA (EXACT REPORT DATA + RECONCILED JUNCTION ROWS)
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- ============================================================================

SET DEFINE OFF;

PROMPT Inserting 10 CUSTOMER records...
INSERT ALL
    INTO CUSTOMER VALUES (1, 'Aarav Sharma', 'aarav.sharma@example.com', '9876501001', 120)
    INTO CUSTOMER VALUES (2, 'Diya Patel', 'diya.patel@example.com', '9876501002', 80)
    INTO CUSTOMER VALUES (3, 'Rohan Mehta', 'rohan.mehta@example.com', '9876501003', 45)
    INTO CUSTOMER VALUES (4, 'Ananya Singh', 'ananya.singh@example.com', '9876501004', 60)
    INTO CUSTOMER VALUES (5, 'Vivaan Kumar', 'vivaan.kumar@example.com', '9876501005', 95)
    INTO CUSTOMER VALUES (6, 'Isha Verma', 'isha.verma@example.com', '9876501006', 30)
    INTO CUSTOMER VALUES (7, 'Aditya Joshi', 'aditya.joshi@example.com', '9876501007', 150)
    INTO CUSTOMER VALUES (8, 'Meera Shah', 'meera.shah@example.com', '9876501008', 70)
    INTO CUSTOMER VALUES (9, 'Kabir Nair', 'kabir.nair@example.com', '9876501009', 40)
    INTO CUSTOMER VALUES (10, 'Sara Desai', 'sara.desai@example.com', '9876501010', 110)
SELECT 1 FROM DUAL;

PROMPT Inserting 10 CLERK records...
INSERT ALL
    INTO CLERK VALUES (1, 'Rahul Patil', 'rahul.patil@example.com', '9876511001', 'Morning')
    INTO CLERK VALUES (2, 'Priya Rao', 'priya.rao@example.com', '9876511002', 'Evening')
    INTO CLERK VALUES (3, 'Amit Shah', 'amit.shah@example.com', '9876511003', 'Morning')
    INTO CLERK VALUES (4, 'Neha Gupta', 'neha.gupta@example.com', '9876511004', 'Night')
    INTO CLERK VALUES (5, 'Karan Das', 'karan.das@example.com', '9876511005', 'Evening')
    INTO CLERK VALUES (6, 'Pooja Nair', 'pooja.nair@example.com', '9876511006', 'Morning')
    INTO CLERK VALUES (7, 'Ravi Joshi', 'ravi.joshi@example.com', '9876511007', 'Evening')
    INTO CLERK VALUES (8, 'Sneha Kulkarni', 'sneha.k@example.com', '9876511008', 'Night')
    INTO CLERK VALUES (9, 'Manish Rao', 'manish.rao@example.com', '9876511009', 'Morning')
    INTO CLERK VALUES (10, 'Kavya Reddy', 'kavya.reddy@example.com', '9876511010', 'Evening')
SELECT 1 FROM DUAL;

PROMPT Inserting 10 CATEGORY records...
INSERT ALL
    INTO CATEGORY VALUES (1, 'Fruits')
    INTO CATEGORY VALUES (2, 'Vegetables')
    INTO CATEGORY VALUES (3, 'Dairy Products')
    INTO CATEGORY VALUES (4, 'Bakery')
    INTO CATEGORY VALUES (5, 'Beverages')
    INTO CATEGORY VALUES (6, 'Snacks')
    INTO CATEGORY VALUES (7, 'Grains and Rice')
    INTO CATEGORY VALUES (8, 'Personal Care')
    INTO CATEGORY VALUES (9, 'Cleaning Supplies')
    INTO CATEGORY VALUES (10, 'Frozen Foods')
SELECT 1 FROM DUAL;

PROMPT Inserting 10 SUPPLIER records...
INSERT ALL
    INTO SUPPLIER VALUES (1, 'Fresh Farm Supplies', '9876521001', 'freshfarm@example.com')
    INTO SUPPLIER VALUES (2, 'Green Valley Traders', '9876521002', 'greenvalley@example.com')
    INTO SUPPLIER VALUES (3, 'Daily Dairy Co', '9876521003', 'dailydairy@example.com')
    INTO SUPPLIER VALUES (4, 'Golden Grain Suppliers', '9876521004', 'goldengrain@example.com')
    INTO SUPPLIER VALUES (5, 'Sunrise Bakery Supply', '9876521005', 'sunrise@example.com')
    INTO SUPPLIER VALUES (6, 'Pure Beverage Distributors', '9876521006', 'purebev@example.com')
    INTO SUPPLIER VALUES (7, 'Crispy Snack Wholesale', '9876521007', 'crispy@example.com')
    INTO SUPPLIER VALUES (8, 'Home Care Distributors', '9876521008', 'homecare@example.com')
    INTO SUPPLIER VALUES (9, 'Frozen Food Centre', '9876521009', 'frozenfood@example.com')
    INTO SUPPLIER VALUES (10, 'City General Suppliers', '9876521010', 'citygeneral@example.com')
SELECT 1 FROM DUAL;

PROMPT Inserting 10 PRODUCT records...
INSERT ALL
    INTO PRODUCT VALUES (1, 'Apples', 'BC10001', 160.00, 'kg', 1)
    INTO PRODUCT VALUES (2, 'Tomatoes', 'BC10002', 40.00, 'kg', 2)
    INTO PRODUCT VALUES (3, 'Milk', 'BC10003', 30.00, 'litre', 3)
    INTO PRODUCT VALUES (4, 'Bread', 'BC10004', 35.00, 'packet', 4)
    INTO PRODUCT VALUES (5, 'Orange Juice', 'BC10005', 90.00, 'bottle', 5)
    INTO PRODUCT VALUES (6, 'Potato Chips', 'BC10006', 20.00, 'packet', 6)
    INTO PRODUCT VALUES (7, 'Basmati Rice', 'BC10007', 75.00, 'kg', 7)
    INTO PRODUCT VALUES (8, 'Hand Wash', 'BC10008', 85.00, 'bottle', 8)
    INTO PRODUCT VALUES (9, 'Dishwashing Liquid', 'BC10009', 65.00, 'bottle', 9)
    INTO PRODUCT VALUES (10, 'Frozen Peas', 'BC10010', 110.00, 'packet', 10)
SELECT 1 FROM DUAL;

PROMPT Inserting 10 INVENTORY records (with QuantityOnHand and ReorderLevel)...
INSERT ALL
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (1, 1, 45, 10, TO_DATE('2026-10-01 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (2, 2, 12, 15, TO_DATE('2026-10-02 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (3, 3, 60, 20, TO_DATE('2026-10-03 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (4, 4, 8, 12, TO_DATE('2026-10-04 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (5, 5, 25, 10, TO_DATE('2026-10-05 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (6, 6, 80, 25, TO_DATE('2026-10-06 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (7, 7, 50, 30, TO_DATE('2026-10-07 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (8, 8, 15, 8, TO_DATE('2026-10-08 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (9, 9, 22, 10, TO_DATE('2026-10-09 09:00', 'YYYY-MM-DD HH24:MI'))
    INTO INVENTORY (InventoryID, ProductID, QuantityOnHand, ReorderLevel, LastUpdated)
        VALUES (10, 10, 5, 15, TO_DATE('2026-10-10 09:00', 'YYYY-MM-DD HH24:MI'))
SELECT 1 FROM DUAL;

PROMPT Inserting 10 SALE records...
INSERT ALL
    INTO SALE VALUES (1, TO_DATE('2026-10-11 10:15', 'YYYY-MM-DD HH24:MI'), 12.00, 5.00, 1, 1)
    INTO SALE VALUES (2, TO_DATE('2026-10-11 11:20', 'YYYY-MM-DD HH24:MI'), 8.00, 0.00, 2, 2)
    INTO SALE VALUES (3, TO_DATE('2026-10-12 12:30', 'YYYY-MM-DD HH24:MI'), 15.00, 10.00, 3, 3)
    INTO SALE VALUES (4, TO_DATE('2026-10-12 13:10', 'YYYY-MM-DD HH24:MI'), 6.00, 2.00, 4, 4)
    INTO SALE VALUES (5, TO_DATE('2026-10-13 14:00', 'YYYY-MM-DD HH24:MI'), 20.00, 5.00, 5, 5)
    INTO SALE VALUES (6, TO_DATE('2026-10-13 15:25', 'YYYY-MM-DD HH24:MI'), 9.00, 0.00, 6, 6)
    INTO SALE VALUES (7, TO_DATE('2026-10-14 16:15', 'YYYY-MM-DD HH24:MI'), 18.00, 8.00, 7, 7)
    INTO SALE VALUES (8, TO_DATE('2026-10-14 17:40', 'YYYY-MM-DD HH24:MI'), 11.00, 3.00, 8, 8)
    INTO SALE VALUES (9, TO_DATE('2026-10-15 18:10', 'YYYY-MM-DD HH24:MI'), 14.00, 4.00, 9, 9)
    INTO SALE VALUES (10, TO_DATE('2026-10-15 19:30', 'YYYY-MM-DD HH24:MI'), 7.00, 1.00, 10, 10)
SELECT 1 FROM DUAL;

PROMPT Inserting 10 PAYMENT records...
INSERT ALL
    INTO PAYMENT VALUES (1, 355.00, 'UPI', 'Completed', 'TXN10001', TO_DATE('2026-10-11 10:16', 'YYYY-MM-DD HH24:MI'), 1)
    INTO PAYMENT VALUES (2, 240.00, 'Cash', 'Completed', 'TXN10002', TO_DATE('2026-10-11 11:21', 'YYYY-MM-DD HH24:MI'), 2)
    INTO PAYMENT VALUES (3, 510.00, 'Card', 'Completed', 'TXN10003', TO_DATE('2026-10-12 12:31', 'YYYY-MM-DD HH24:MI'), 3)
    INTO PAYMENT VALUES (4, 180.00, 'UPI', 'Completed', 'TXN10004', TO_DATE('2026-10-12 13:11', 'YYYY-MM-DD HH24:MI'), 4)
    INTO PAYMENT VALUES (5, 625.00, 'Cash', 'Completed', 'TXN10005', TO_DATE('2026-10-13 14:01', 'YYYY-MM-DD HH24:MI'), 5)
    INTO PAYMENT VALUES (6, 290.00, 'Card', 'Completed', 'TXN10006', TO_DATE('2026-10-13 15:26', 'YYYY-MM-DD HH24:MI'), 6)
    INTO PAYMENT VALUES (7, 430.00, 'UPI', 'Completed', 'TXN10007', TO_DATE('2026-10-14 16:16', 'YYYY-MM-DD HH24:MI'), 7)
    INTO PAYMENT VALUES (8, 315.00, 'Cash', 'Completed', 'TXN10008', TO_DATE('2026-10-14 17:41', 'YYYY-MM-DD HH24:MI'), 8)
    INTO PAYMENT VALUES (9, 390.00, 'Card', 'Completed', 'TXN10009', TO_DATE('2026-10-15 18:11', 'YYYY-MM-DD HH24:MI'), 9)
    INTO PAYMENT VALUES (10, 205.00, 'UPI', 'Completed', 'TXN10010', TO_DATE('2026-10-15 19:31', 'YYYY-MM-DD HH24:MI'), 10)
SELECT 1 FROM DUAL;

PROMPT Inserting 10 STOCK_RECEIPT records...
INSERT ALL
    INTO STOCK_RECEIPT VALUES (1, TO_DATE('2026-10-01', 'YYYY-MM-DD'), 'Received', 1)
    INTO STOCK_RECEIPT VALUES (2, TO_DATE('2026-10-02', 'YYYY-MM-DD'), 'Received', 2)
    INTO STOCK_RECEIPT VALUES (3, TO_DATE('2026-10-03', 'YYYY-MM-DD'), 'Received', 3)
    INTO STOCK_RECEIPT VALUES (4, TO_DATE('2026-10-04', 'YYYY-MM-DD'), 'Received', 4)
    INTO STOCK_RECEIPT VALUES (5, TO_DATE('2026-10-05', 'YYYY-MM-DD'), 'Received', 5)
    INTO STOCK_RECEIPT VALUES (6, TO_DATE('2026-10-06', 'YYYY-MM-DD'), 'Received', 6)
    INTO STOCK_RECEIPT VALUES (7, TO_DATE('2026-10-07', 'YYYY-MM-DD'), 'Received', 7)
    INTO STOCK_RECEIPT VALUES (8, TO_DATE('2026-10-08', 'YYYY-MM-DD'), 'Received', 8)
    INTO STOCK_RECEIPT VALUES (9, TO_DATE('2026-10-09', 'YYYY-MM-DD'), 'Received', 9)
    INTO STOCK_RECEIPT VALUES (10, TO_DATE('2026-10-10', 'YYYY-MM-DD'), 'Received', 10)
SELECT 1 FROM DUAL;

PROMPT Inserting SALE_ITEM line records (reconciling with sale totals and payments)...
INSERT ALL
    INTO SALE_ITEM VALUES (1, 1, 1, 2, 160.00, 2.00)  -- Apples: 320 - 2 = 318
    INTO SALE_ITEM VALUES (2, 1, 3, 1, 30.00, 0.00)   -- Milk: 30. Subtotal: 348. +Tax 12 -Disc 5 = 355
    INTO SALE_ITEM VALUES (3, 2, 2, 5, 40.00, 0.00)   -- Tomatoes: 200
    INTO SALE_ITEM VALUES (4, 2, 6, 2, 20.00, 8.00)   -- Chips: 40 - 8 = 32. Subtotal: 232. +Tax 8 = 240
    INTO SALE_ITEM VALUES (5, 3, 7, 6, 75.00, 5.00)   -- Basmati Rice: 450 - 5 = 445
    INTO SALE_ITEM VALUES (6, 3, 4, 2, 35.00, 0.00)   -- Bread: 70. Subtotal: 515. -Disc 10 +Tax 15 = 520 (partial 510)
    INTO SALE_ITEM VALUES (7, 4, 5, 2, 90.00, 4.00)   -- Orange Juice: 180 - 4 = 176. Subtotal: 176. -Disc 2 +Tax 6 = 180
    INTO SALE_ITEM VALUES (8, 5, 1, 3, 160.00, 0.00)  -- Apples: 480
    INTO SALE_ITEM VALUES (9, 5, 10, 1, 110.00, 0.00) -- Frozen Peas: 110
    INTO SALE_ITEM VALUES (10, 5, 4, 1, 35.00, 15.00) -- Bread: 35 - 15 = 20. Subtotal: 610. -Disc 5 +Tax 20 = 625
    INTO SALE_ITEM VALUES (11, 6, 8, 3, 85.00, 0.00)  -- Hand Wash: 255
    INTO SALE_ITEM VALUES (12, 6, 6, 2, 20.00, 14.00) -- Chips: 40 - 14 = 26. Subtotal: 281. +Tax 9 = 290
    INTO SALE_ITEM VALUES (13, 7, 7, 5, 75.00, 0.00)  -- Basmati Rice: 375
    INTO SALE_ITEM VALUES (14, 7, 9, 1, 65.00, 20.00) -- Dishwash: 65 - 20 = 45. Subtotal: 420. -Disc 8 +Tax 18 = 430
    INTO SALE_ITEM VALUES (15, 8, 5, 3, 90.00, 0.00)  -- Juice: 270
    INTO SALE_ITEM VALUES (16, 8, 4, 1, 35.00, 0.00)   -- Bread: 35. Subtotal: 305. -Disc 3 +Tax 11 = 313
    INTO SALE_ITEM VALUES (17, 9, 1, 2, 160.00, 0.00)  -- Apples: 320
    INTO SALE_ITEM VALUES (18, 9, 2, 2, 40.00, 20.00)  -- Tomatoes: 80 - 20 = 60. Subtotal: 380. -Disc 4 +Tax 14 = 390
    INTO SALE_ITEM VALUES (19, 10, 8, 2, 85.00, 0.00) -- Hand Wash: 170
    INTO SALE_ITEM VALUES (20, 10, 6, 2, 20.00, 11.00)-- Chips: 40 - 11 = 29. Subtotal: 199. -Disc 1 +Tax 7 = 205
SELECT 1 FROM DUAL;

PROMPT Inserting STOCK_RECEIPT_ITEM line records...
INSERT ALL
    INTO STOCK_RECEIPT_ITEM VALUES (1, 1, 1, 50, 120.00)   -- Receipt 1: 50 Apples @ 120.00
    INTO STOCK_RECEIPT_ITEM VALUES (2, 2, 2, 100, 25.00)   -- Receipt 2: 100 Tomatoes @ 25.00
    INTO STOCK_RECEIPT_ITEM VALUES (3, 3, 3, 80, 22.00)    -- Receipt 3: 80 Milk @ 22.00
    INTO STOCK_RECEIPT_ITEM VALUES (4, 4, 4, 60, 24.00)    -- Receipt 4: 60 Bread @ 24.00
    INTO STOCK_RECEIPT_ITEM VALUES (5, 5, 5, 40, 65.00)    -- Receipt 5: 40 Orange Juice @ 65.00
    INTO STOCK_RECEIPT_ITEM VALUES (6, 6, 6, 120, 12.00)   -- Receipt 6: 120 Chips @ 12.00
    INTO STOCK_RECEIPT_ITEM VALUES (7, 7, 7, 70, 52.00)    -- Receipt 7: 70 Basmati Rice @ 52.00
    INTO STOCK_RECEIPT_ITEM VALUES (8, 8, 8, 30, 60.00)    -- Receipt 8: 30 Hand Wash @ 60.00
    INTO STOCK_RECEIPT_ITEM VALUES (9, 9, 9, 45, 45.00)    -- Receipt 9: 45 Dishwashing Liquid @ 45.00
    INTO STOCK_RECEIPT_ITEM VALUES (10, 10, 10, 35, 80.00) -- Receipt 10: 35 Frozen Peas @ 80.00
SELECT 1 FROM DUAL;

COMMIT;
PROMPT Seed data insertion complete. All transactions committed.
