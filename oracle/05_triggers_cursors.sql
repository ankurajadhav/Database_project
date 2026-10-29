-- ============================================================================
-- SCRIPT 05: TRIGGERS & EXPLICIT CURSORS
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- ============================================================================

PROMPT Creating Trigger 1: TRG_INVENTORY_UPDATED (Report Page 55)
CREATE OR REPLACE TRIGGER TRG_INVENTORY_UPDATED
BEFORE UPDATE ON INVENTORY
FOR EACH ROW
BEGIN
    :NEW.LastUpdated := SYSDATE;
END;
/

PROMPT Creating Trigger 2: TRG_PAYMENT_STATUS_CHECK (Report Page 56)
CREATE OR REPLACE TRIGGER TRG_PAYMENT_STATUS_CHECK
BEFORE INSERT OR UPDATE ON PAYMENT
FOR EACH ROW
BEGIN
    IF :NEW.PaymentStatus IS NULL 
       OR UPPER(TRIM(:NEW.PaymentStatus)) NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') THEN
        RAISE_APPLICATION_ERROR(-20006, 'Invalid payment status.');
    END IF;

    :NEW.PaymentStatus := INITCAP(LOWER(TRIM(:NEW.PaymentStatus)));
END;
/

PROMPT Demonstrating Explicit Cursor 1: Customer Sales Count (Report Page 58)
SET SERVEROUTPUT ON;
DECLARE
    CURSOR C_CUSTOMER_SALES IS
        SELECT C.CustomerID,
               C.CustomerName,
               COUNT(S.SaleID) AS SalesCount
        FROM CUSTOMER C
        LEFT JOIN SALE S ON C.CustomerID = S.CustomerID
        GROUP BY C.CustomerID, C.CustomerName
        ORDER BY C.CustomerID;

    v_record C_CUSTOMER_SALES%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- CURSOR 1: CUSTOMER SALES COUNT ---');
    OPEN C_CUSTOMER_SALES;
    LOOP
        FETCH C_CUSTOMER_SALES INTO v_record;
        EXIT WHEN C_CUSTOMER_SALES%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            v_record.CustomerID || ' - ' ||
            RPAD(v_record.CustomerName, 18) || ' - Sales: ' ||
            v_record.SalesCount
        );
    END LOOP;
    CLOSE C_CUSTOMER_SALES;
END;
/

PROMPT Demonstrating Explicit Cursor 2: Stock Receipts and Suppliers (Report Page 59)
DECLARE
    CURSOR C_RECEIPTS IS
        SELECT R.ReceiptID,
               S.SupplierName,
               R.ReceiptDate,
               R.ReceiptStatus
        FROM STOCK_RECEIPT R
        JOIN SUPPLIER S ON R.SupplierID = S.SupplierID
        ORDER BY R.ReceiptID;

    v_record C_RECEIPTS%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- CURSOR 2: STOCK RECEIPTS AND SUPPLIERS ---');
    OPEN C_RECEIPTS;
    LOOP
        FETCH C_RECEIPTS INTO v_record;
        EXIT WHEN C_RECEIPTS%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            'Receipt: ' || LPAD(v_record.ReceiptID, 2) ||
            ' | Supplier: ' || RPAD(v_record.SupplierName, 26) ||
            ' | Status: ' || v_record.ReceiptStatus
        );
    END LOOP;
    CLOSE C_RECEIPTS;
END;
/

PROMPT Triggers and Cursors verified successfully.
