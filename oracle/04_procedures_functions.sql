-- ============================================================================
-- SCRIPT 04: STORED PROCEDURES & USER-DEFINED FUNCTIONS
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- ============================================================================

PROMPT Creating Stored Procedure 1: PROC_ADD_LOYALTY_POINTS (Report Page 51)
CREATE OR REPLACE PROCEDURE PROC_ADD_LOYALTY_POINTS (
    p_customer_id IN CUSTOMER.CustomerID%TYPE,
    p_points      IN NUMBER
) AS
BEGIN
    IF p_points IS NULL OR p_points <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Points must be greater than zero.');
    END IF;

    UPDATE CUSTOMER
    SET LoyaltyPoints = LoyaltyPoints + p_points
    WHERE CustomerID = p_customer_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Customer ID not found.');
    END IF;
END PROC_ADD_LOYALTY_POINTS;
/

PROMPT Creating Stored Procedure 2: PROC_UPDATE_PAYMENT_STATUS (Report Page 52)
CREATE OR REPLACE PROCEDURE PROC_UPDATE_PAYMENT_STATUS (
    p_payment_id  IN PAYMENT.PaymentID%TYPE,
    p_new_status  IN VARCHAR2
) AS
    v_status VARCHAR2(30);
BEGIN
    IF p_new_status IS NULL THEN
        RAISE_APPLICATION_ERROR(-20003, 'Payment status cannot be null.');
    END IF;

    v_status := UPPER(TRIM(p_new_status));

    IF v_status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') THEN
        RAISE_APPLICATION_ERROR(-20004, 'Invalid payment status.');
    END IF;

    UPDATE PAYMENT
    SET PaymentStatus = INITCAP(LOWER(v_status))
    WHERE PaymentID = p_payment_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Payment ID not found.');
    END IF;
END PROC_UPDATE_PAYMENT_STATUS;
/

PROMPT Creating Stored Procedure 3: PROC_RECEIVE_STOCK (Atomic Receiving Workflow with Double-Receipt Guard)
CREATE OR REPLACE PROCEDURE PROC_RECEIVE_STOCK (
    p_receipt_id IN STOCK_RECEIPT.ReceiptID%TYPE
) AS
    v_current_status VARCHAR2(30);
BEGIN
    -- 1. Check receipt existence and current status
    SELECT ReceiptStatus INTO v_current_status
    FROM STOCK_RECEIPT
    WHERE ReceiptID = p_receipt_id
    FOR UPDATE;

    IF v_current_status = 'Received' THEN
        RAISE_APPLICATION_ERROR(-20010, 'Double processing prevented: Stock receipt is already marked as Received.');
    END IF;

    IF v_current_status = 'Cancelled' THEN
        RAISE_APPLICATION_ERROR(-20011, 'Invalid state: Cannot receive a Cancelled stock receipt.');
    END IF;

    -- 2. Increase inventory for every line item in the receipt
    FOR r IN (
        SELECT ProductID, QtyReceived 
        FROM STOCK_RECEIPT_ITEM 
        WHERE ReceiptID = p_receipt_id
    ) LOOP
        UPDATE INVENTORY
        SET QuantityOnHand = QuantityOnHand + r.QtyReceived,
            LastUpdated = SYSDATE
        WHERE ProductID = r.ProductID;
    END LOOP;

    -- 3. Update receipt status to 'Received'
    UPDATE STOCK_RECEIPT
    SET ReceiptStatus = 'Received'
    WHERE ReceiptID = p_receipt_id;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20012, 'Stock receipt ID not found: ' || p_receipt_id);
END PROC_RECEIVE_STOCK;
/

PROMPT Creating User-Defined Function 1: FN_CUSTOMER_TOTAL_PAID (Report Page 53)
CREATE OR REPLACE FUNCTION FN_CUSTOMER_TOTAL_PAID (
    p_customer_id IN CUSTOMER.CustomerID%TYPE
) RETURN NUMBER AS
    v_total NUMBER(12,2);
BEGIN
    SELECT NVL(SUM(P.Amount), 0)
    INTO v_total
    FROM SALE S
    JOIN PAYMENT P ON S.SaleID = P.SaleID
    WHERE S.CustomerID = p_customer_id
      AND UPPER(P.PaymentStatus) = 'COMPLETED';

    RETURN v_total;
END FN_CUSTOMER_TOTAL_PAID;
/

PROMPT Creating User-Defined Function 2: FN_PRODUCT_PRICE_LEVEL (Report Page 54)
CREATE OR REPLACE FUNCTION FN_PRODUCT_PRICE_LEVEL (
    p_product_id IN PRODUCT.ProductID%TYPE
) RETURN VARCHAR2 AS
    v_price PRODUCT.SellingPrice%TYPE;
BEGIN
    SELECT SellingPrice
    INTO v_price
    FROM PRODUCT
    WHERE ProductID = p_product_id;

    IF v_price >= 100 THEN
        RETURN 'High';
    ELSIF v_price >= 50 THEN
        RETURN 'Medium';
    ELSE
        RETURN 'Low';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Product not found';
END FN_PRODUCT_PRICE_LEVEL;
/

PROMPT Procedures and Functions created successfully.
