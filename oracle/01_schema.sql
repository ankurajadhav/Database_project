-- ============================================================================
-- SCRIPT 01: DDL SCHEMA DEFINITION (11 TABLES IN 3NF)
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- Institution: Vellore Institute of Technology (VIT)
-- Evaluator: Dr. Anand Bihari
-- ============================================================================

PROMPT Creating Table 1: CUSTOMER
CREATE TABLE CUSTOMER (
    CustomerID      NUMBER(10),
    CustomerName    VARCHAR2(100) NOT NULL,
    CustomerEmail   VARCHAR2(150),
    CustomerPhone   VARCHAR2(15),
    LoyaltyPoints   NUMBER(10) DEFAULT 0 NOT NULL,
    CONSTRAINT pk_customer PRIMARY KEY (CustomerID),
    CONSTRAINT ck_customer_points CHECK (LoyaltyPoints >= 0)
);

PROMPT Creating Table 2: CLERK
CREATE TABLE CLERK (
    ClerkID         NUMBER(10),
    ClerkName       VARCHAR2(100) NOT NULL,
    ClerkEmail      VARCHAR2(150),
    ClerkPhone      VARCHAR2(15),
    Shift           VARCHAR2(30),
    CONSTRAINT pk_clerk PRIMARY KEY (ClerkID)
);

PROMPT Creating Table 3: CATEGORY
CREATE TABLE CATEGORY (
    CategoryID      NUMBER(10),
    CategoryName    VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_category PRIMARY KEY (CategoryID)
);

PROMPT Creating Table 4: SUPPLIER
CREATE TABLE SUPPLIER (
    SupplierID      NUMBER(10),
    SupplierName    VARCHAR2(100) NOT NULL,
    SupplierPhone   VARCHAR2(15),
    SupplierEmail   VARCHAR2(150),
    CONSTRAINT pk_supplier PRIMARY KEY (SupplierID)
);

PROMPT Creating Table 5: PRODUCT
CREATE TABLE PRODUCT (
    ProductID       NUMBER(10),
    ProductName     VARCHAR2(150) NOT NULL,
    Barcode         VARCHAR2(50),
    SellingPrice    NUMBER(10,2) NOT NULL,
    Unit            VARCHAR2(30) NOT NULL,
    CategoryID      NUMBER(10) NOT NULL,
    CONSTRAINT pk_product PRIMARY KEY (ProductID),
    CONSTRAINT ck_product_price CHECK (SellingPrice >= 0),
    CONSTRAINT fk_product_category FOREIGN KEY (CategoryID) 
        REFERENCES CATEGORY(CategoryID)
);

PROMPT Creating Table 6: INVENTORY
-- Note: Added QuantityOnHand to support stock operations while maintaining 1:1 relationship with PRODUCT
CREATE TABLE INVENTORY (
    InventoryID     NUMBER(10),
    ProductID       NUMBER(10) NOT NULL,
    QuantityOnHand  NUMBER(10) DEFAULT 0 NOT NULL,
    ReorderLevel    NUMBER(10) DEFAULT 0 NOT NULL,
    LastUpdated     DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT pk_inventory PRIMARY KEY (InventoryID),
    CONSTRAINT uq_inventory_product UNIQUE (ProductID),
    CONSTRAINT ck_inventory_qty CHECK (QuantityOnHand >= 0),
    CONSTRAINT ck_inventory_reorder CHECK (ReorderLevel >= 0),
    CONSTRAINT fk_inventory_product FOREIGN KEY (ProductID) 
        REFERENCES PRODUCT(ProductID)
);

PROMPT Creating Table 7: SALE
CREATE TABLE SALE (
    SaleID              NUMBER(10),
    SaleDateTime        DATE DEFAULT SYSDATE NOT NULL,
    TaxAmount           NUMBER(10,2) DEFAULT 0 NOT NULL,
    OrderDiscountAmount NUMBER(10,2) DEFAULT 0 NOT NULL,
    CustomerID          NUMBER(10) NOT NULL,
    ClerkID             NUMBER(10) NOT NULL,
    CONSTRAINT pk_sale PRIMARY KEY (SaleID),
    CONSTRAINT ck_sale_tax CHECK (TaxAmount >= 0),
    CONSTRAINT ck_sale_discount CHECK (OrderDiscountAmount >= 0),
    CONSTRAINT fk_sale_customer FOREIGN KEY (CustomerID) 
        REFERENCES CUSTOMER(CustomerID),
    CONSTRAINT fk_sale_clerk FOREIGN KEY (ClerkID) 
        REFERENCES CLERK(ClerkID)
);

PROMPT Creating Table 8: PAYMENT
CREATE TABLE PAYMENT (
    PaymentID       NUMBER(10),
    Amount          NUMBER(10,2) NOT NULL,
    PaymentMethod   VARCHAR2(30) NOT NULL,
    PaymentStatus   VARCHAR2(30) NOT NULL,
    TransactionRef  VARCHAR2(100),
    PaymentDateTime DATE DEFAULT SYSDATE NOT NULL,
    SaleID          NUMBER(10) NOT NULL,
    CONSTRAINT pk_payment PRIMARY KEY (PaymentID),
    CONSTRAINT ck_payment_amount CHECK (Amount > 0),
    CONSTRAINT fk_payment_sale FOREIGN KEY (SaleID) 
        REFERENCES SALE(SaleID)
);

PROMPT Creating Table 9: STOCK_RECEIPT
CREATE TABLE STOCK_RECEIPT (
    ReceiptID       NUMBER(10),
    ReceiptDate     DATE DEFAULT SYSDATE NOT NULL,
    ReceiptStatus   VARCHAR2(30) NOT NULL,
    SupplierID      NUMBER(10) NOT NULL,
    CONSTRAINT pk_stock_receipt PRIMARY KEY (ReceiptID),
    CONSTRAINT fk_receipt_supplier FOREIGN KEY (SupplierID) 
        REFERENCES SUPPLIER(SupplierID)
);

PROMPT Creating Table 10: SALE_ITEM (Resolves M:N CONTAINS Relationship)
CREATE TABLE SALE_ITEM (
    SaleItemID          NUMBER(10),
    SaleID              NUMBER(10) NOT NULL,
    ProductID           NUMBER(10) NOT NULL,
    QuantitySold        NUMBER(10) NOT NULL,
    UnitPriceAtSale     NUMBER(10,2) NOT NULL,
    LineDiscount        NUMBER(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT pk_sale_item PRIMARY KEY (SaleItemID),
    CONSTRAINT uq_sale_item_product UNIQUE (SaleID, ProductID),
    CONSTRAINT ck_sale_item_qty CHECK (QuantitySold > 0),
    CONSTRAINT ck_sale_item_price CHECK (UnitPriceAtSale >= 0),
    CONSTRAINT ck_sale_item_discount CHECK (LineDiscount >= 0),
    CONSTRAINT fk_sale_item_sale FOREIGN KEY (SaleID) 
        REFERENCES SALE(SaleID) ON DELETE CASCADE,
    CONSTRAINT fk_sale_item_product FOREIGN KEY (ProductID) 
        REFERENCES PRODUCT(ProductID)
);

PROMPT Creating Table 11: STOCK_RECEIPT_ITEM (Resolves M:N INCLUDES Relationship)
CREATE TABLE STOCK_RECEIPT_ITEM (
    ReceiptItemID       NUMBER(10),
    ReceiptID           NUMBER(10) NOT NULL,
    ProductID           NUMBER(10) NOT NULL,
    QtyReceived         NUMBER(10) NOT NULL,
    PurchaseUnitCost    NUMBER(10,2) NOT NULL,
    CONSTRAINT pk_stock_receipt_item PRIMARY KEY (ReceiptItemID),
    CONSTRAINT uq_rcpt_item_product UNIQUE (ReceiptID, ProductID),
    CONSTRAINT ck_rcpt_item_qty CHECK (QtyReceived > 0),
    CONSTRAINT ck_rcpt_item_cost CHECK (PurchaseUnitCost >= 0),
    CONSTRAINT fk_rcpt_item_receipt FOREIGN KEY (ReceiptID) 
        REFERENCES STOCK_RECEIPT(ReceiptID) ON DELETE CASCADE,
    CONSTRAINT fk_rcpt_item_product FOREIGN KEY (ProductID) 
        REFERENCES PRODUCT(ProductID)
);

PROMPT All 11 tables created successfully with complete primary, foreign, unique, and check constraints.
