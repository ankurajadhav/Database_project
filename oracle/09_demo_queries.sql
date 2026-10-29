-- ============================================================================
-- SCRIPT 09: DEMONSTRATION QUERIES (COMPLETE REPORT COVERAGE)
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- ============================================================================

PROMPT ====================================================
PROMPT A. BASIC SQL QUERIES (A1 to A6)
PROMPT ====================================================

PROMPT A1. SELECT, WHERE, ORDER BY (Products priced over 50)
SELECT ProductID, ProductName, SellingPrice
FROM PRODUCT
WHERE SellingPrice > 50
ORDER BY SellingPrice DESC;

PROMPT A2. DISTINCT (Unique shifts worked by clerks)
SELECT DISTINCT Shift
FROM CLERK
ORDER BY Shift;

PROMPT A3. BETWEEN (Products between 30 and 100)
SELECT ProductName, SellingPrice
FROM PRODUCT
WHERE SellingPrice BETWEEN 30 AND 100
ORDER BY SellingPrice;

PROMPT A4. IN (Products in Categories 1, 3, 5, 7)
SELECT ProductName, CategoryID
FROM PRODUCT
WHERE CategoryID IN (1, 3, 5, 7)
ORDER BY CategoryID;

PROMPT A5. LIKE (Products containing 'a')
SELECT ProductID, ProductName
FROM PRODUCT
WHERE ProductName LIKE '%a%'
ORDER BY ProductName;

PROMPT A6. IS NULL (Audit for missing customer emails)
SELECT COUNT(*) AS MissingEmails
FROM CUSTOMER
WHERE CustomerEmail IS NULL;

PROMPT ====================================================
PROMPT B. AGGREGATE SQL QUERIES (B1 to B5)
PROMPT ====================================================

PROMPT B1. COUNT (Total Customers)
SELECT COUNT(*) AS TotalCustomers
FROM CUSTOMER;

PROMPT B2. SUM (Total Loyalty Points in circulation)
SELECT SUM(LoyaltyPoints) AS TotalLoyaltyPoints
FROM CUSTOMER;

PROMPT B3. AVG (Average Product Selling Price)
SELECT ROUND(AVG(SellingPrice), 2) AS AveragePrice
FROM PRODUCT;

PROMPT B4. MIN and MAX (Price extremes)
SELECT MIN(SellingPrice) AS LowestPrice,
       MAX(SellingPrice) AS HighestPrice
FROM PRODUCT;

PROMPT B5. GROUP BY, WHERE, and HAVING (Categorical price analysis)
-- Demonstrates difference: WHERE filters rows prior to aggregation, HAVING filters grouped sets
SELECT CategoryID,
       COUNT(*) AS ProductCount,
       ROUND(AVG(SellingPrice), 2) AS AveragePrice
FROM PRODUCT
WHERE SellingPrice >= 30
GROUP BY CategoryID
HAVING AVG(SellingPrice) >= 50
ORDER BY CategoryID;

PROMPT ====================================================
PROMPT C. JOIN QUERIES (C1 to C6)
PROMPT ====================================================

PROMPT C1. INNER JOIN (Sales with Customer and Clerk details)
SELECT S.SaleID,
       C.CustomerName,
       K.ClerkName,
       S.SaleDateTime
FROM SALE S
INNER JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
INNER JOIN CLERK K ON S.ClerkID = K.ClerkID
ORDER BY S.SaleID;

PROMPT C2. LEFT OUTER JOIN (Categories and premium products priced > 100)
SELECT C.CategoryName, P.ProductName, P.SellingPrice
FROM CATEGORY C
LEFT OUTER JOIN PRODUCT P ON C.CategoryID = P.CategoryID AND P.SellingPrice > 100
ORDER BY C.CategoryID;

PROMPT C3. RIGHT OUTER JOIN (Equivalent outer join coverage)
SELECT C.CategoryName, P.ProductName, P.SellingPrice
FROM PRODUCT P
RIGHT OUTER JOIN CATEGORY C ON C.CategoryID = P.CategoryID AND P.SellingPrice > 100
ORDER BY C.CategoryID;

PROMPT C4. FULL OUTER JOIN
SELECT C.CategoryName, P.ProductName, P.SellingPrice
FROM CATEGORY C
FULL OUTER JOIN PRODUCT P ON C.CategoryID = P.CategoryID AND P.SellingPrice > 100
ORDER BY C.CategoryName, P.ProductName;

PROMPT C5. SELF JOIN (Clerks working on the same shift)
SELECT C1.ClerkName AS Clerk1,
       C2.ClerkName AS Clerk2,
       C1.Shift
FROM CLERK C1
JOIN CLERK C2 ON C1.Shift = C2.Shift AND C1.ClerkID < C2.ClerkID
ORDER BY C1.Shift, C1.ClerkID;

PROMPT C6. MEANINGFUL CROSS JOIN (Tax Simulation Matrix for Products)
SELECT P.ProductName,
       P.SellingPrice,
       T.TaxRate,
       ROUND(P.SellingPrice * (1 + T.TaxRate), 2) AS PriceIncludingTax
FROM PRODUCT P
CROSS JOIN (
    SELECT 0.05 AS TaxRate FROM DUAL
    UNION ALL
    SELECT 0.10 FROM DUAL
    UNION ALL
    SELECT 0.18 FROM DUAL
) T
WHERE P.ProductID <= 3
ORDER BY P.ProductID, T.TaxRate;

PROMPT ====================================================
PROMPT D. SUBQUERIES (D1 to D9)
PROMPT ====================================================

PROMPT D1. Scalar Subquery (Products priced above the overall average)
SELECT ProductName, SellingPrice
FROM PRODUCT
WHERE SellingPrice > (SELECT AVG(SellingPrice) FROM PRODUCT)
ORDER BY SellingPrice DESC;

PROMPT D2. Single-Row Subquery (Products belonging to 'Fruits')
SELECT ProductName, SellingPrice
FROM PRODUCT
WHERE CategoryID = (SELECT CategoryID FROM CATEGORY WHERE CategoryName = 'Fruits');

PROMPT D3. Multi-Row Subquery using IN
SELECT ProductName, CategoryID
FROM PRODUCT
WHERE CategoryID IN (SELECT CategoryID FROM CATEGORY WHERE CategoryName IN ('Fruits', 'Dairy Products', 'Beverages'))
ORDER BY CategoryID;

PROMPT D4. Multi-Row Subquery using ANY
SELECT ProductName, SellingPrice
FROM PRODUCT
WHERE SellingPrice > ANY (SELECT SellingPrice FROM PRODUCT WHERE CategoryID IN (2, 3, 4))
ORDER BY SellingPrice;

PROMPT D5. Multi-Row Subquery using ALL
SELECT ProductName, SellingPrice
FROM PRODUCT
WHERE SellingPrice > ALL (SELECT SellingPrice FROM PRODUCT WHERE CategoryID IN (2, 3, 4))
ORDER BY SellingPrice DESC;

PROMPT D6. Correlated Subquery (Customers who made at least one sale)
SELECT C.CustomerID, C.CustomerName
FROM CUSTOMER C
WHERE (SELECT COUNT(*) FROM SALE S WHERE S.CustomerID = C.CustomerID) > 0
ORDER BY C.CustomerID;

PROMPT D7. EXISTS Subquery (Sales having at least one payment recorded)
SELECT S.SaleID, S.SaleDateTime
FROM SALE S
WHERE EXISTS (SELECT 1 FROM PAYMENT P WHERE P.SaleID = S.SaleID)
ORDER BY S.SaleID;

PROMPT D8. NOT EXISTS Subquery (Categories without any luxury products > 100)
SELECT C.CategoryID, C.CategoryName
FROM CATEGORY C
WHERE NOT EXISTS (SELECT 1 FROM PRODUCT P WHERE P.CategoryID = C.CategoryID AND P.SellingPrice > 100)
ORDER BY C.CategoryID;

PROMPT D9. NOT IN Subquery (Customers whose email is not in supplier registry)
-- Note: Explains why NOT IN returns 0 rows if subquery contains NULL; handled via NVL or NOT EXISTS
SELECT C.CustomerName, C.CustomerEmail
FROM CUSTOMER C
WHERE C.CustomerEmail NOT IN (SELECT NVL(SupplierEmail, 'N/A') FROM SUPPLIER)
ORDER BY C.CustomerID;

PROMPT ====================================================
PROMPT E. SET OPERATIONS (E1 to E4)
PROMPT ====================================================

PROMPT E1. UNION (Distinct list of all people in the system)
SELECT CustomerName AS PersonName FROM CUSTOMER
UNION
SELECT ClerkName FROM CLERK
ORDER BY PersonName;

PROMPT E2. UNION ALL (Preserves duplicates across customer and clerk registries)
SELECT CustomerName AS PersonName FROM CUSTOMER
UNION ALL
SELECT ClerkName FROM CLERK
ORDER BY PersonName;

PROMPT E3. INTERSECT (Products in price range [50, 100])
SELECT ProductName FROM PRODUCT WHERE SellingPrice >= 50
INTERSECT
SELECT ProductName FROM PRODUCT WHERE SellingPrice <= 100
ORDER BY ProductName;

PROMPT E4. MINUS (Products priced >= 50 excluding those under 50)
SELECT ProductName FROM PRODUCT
MINUS
SELECT ProductName FROM PRODUCT WHERE SellingPrice < 50
ORDER BY ProductName;

PROMPT ====================================================
PROMPT F. ADVANCED FUNCTIONS (F1 to F6)
PROMPT ====================================================

PROMPT F1. CASE Expression (Price Classification)
SELECT ProductName, SellingPrice,
       CASE 
           WHEN SellingPrice >= 100 THEN 'High'
           WHEN SellingPrice >= 50 THEN 'Medium'
           ELSE 'Low'
       END AS PriceCategory
FROM PRODUCT
ORDER BY SellingPrice DESC;

PROMPT F2. COALESCE (Fallbacks for contact data)
SELECT CustomerName,
       COALESCE(CustomerEmail, 'Email not provided') AS EmailAddress
FROM CUSTOMER
ORDER BY CustomerID;

PROMPT F3. NULLIF (Comparing price to benchmark)
SELECT ProductName, SellingPrice,
       NULLIF(SellingPrice, 160) AS AdjustedPrice
FROM PRODUCT
ORDER BY ProductID;

PROMPT F4. Date and Time Functions (Formatting and Extraction)
SELECT SaleID,
       TO_CHAR(SaleDateTime, 'DD-MON-YYYY HH24:MI') AS FormattedSaleTime,
       EXTRACT(YEAR FROM SaleDateTime) AS SaleYear
FROM SALE
ORDER BY SaleDateTime;

PROMPT F5. String Functions (Case conversion, substring, length)
SELECT CustomerName,
       UPPER(CustomerName) AS UpperName,
       SUBSTR(CustomerName, 1, 3) AS FirstThreeLetters,
       LENGTH(CustomerName) AS NameLength
FROM CUSTOMER
ORDER BY CustomerID;

PROMPT F6. Numeric Functions (Rounding and Absolute differences)
SELECT ProductName, SellingPrice,
       ROUND(SellingPrice * 1.05, 2) AS IncreasedPrice,
       ABS(SellingPrice - 100) AS DifferenceFrom100
FROM PRODUCT
ORDER BY ProductID;

PROMPT ====================================================
PROMPT G. WINDOW & ANALYTIC FUNCTIONS (G1 to G2)
PROMPT ====================================================

PROMPT G1. RANK and ROW_NUMBER (Product price ranking)
SELECT ProductID,
       ProductName,
       SellingPrice,
       RANK() OVER (ORDER BY SellingPrice DESC) AS PriceRank,
       ROW_NUMBER() OVER (ORDER BY SellingPrice DESC, ProductID) AS RowNumber
FROM PRODUCT
ORDER BY SellingPrice DESC;

PROMPT G2. Running Total, LAG and LEAD (Payment Trend Analysis)
SELECT PaymentID,
       SaleID,
       PaymentDateTime,
       Amount,
       SUM(Amount) OVER (
           ORDER BY PaymentDateTime, PaymentID 
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS RunningTotal,
       LAG(Amount) OVER (ORDER BY PaymentDateTime, PaymentID) AS PreviousPayment,
       LEAD(Amount) OVER (ORDER BY PaymentDateTime, PaymentID) AS NextPayment
FROM PAYMENT
ORDER BY PaymentDateTime, PaymentID;

PROMPT ====================================================
PROMPT H. COMPLEX BUSINESS QUERIES (CQ-01 to CQ-10)
PROMPT ====================================================

PROMPT CQ-01: Which customers made purchases, and which clerks processed their sales?
SELECT S.SaleID, C.CustomerName, K.ClerkName, S.SaleDateTime, S.TaxAmount, S.OrderDiscountAmount
FROM SALE S
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
ORDER BY S.SaleID;

PROMPT CQ-02: Which customers made payments, how much did they pay, and which clerks handled their sales?
SELECT P.PaymentID, S.SaleID, C.CustomerName, K.ClerkName, P.Amount, P.PaymentMethod, P.PaymentStatus
FROM PAYMENT P
JOIN SALE S ON P.SaleID = S.SaleID
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
ORDER BY P.Amount DESC;

PROMPT CQ-03: Which products belong to each category, and what is the reorder level for each product?
SELECT C.CategoryName, P.ProductName, P.SellingPrice, I.ReorderLevel, I.LastUpdated
FROM CATEGORY C
JOIN PRODUCT P ON C.CategoryID = P.CategoryID
JOIN INVENTORY I ON P.ProductID = I.ProductID
ORDER BY C.CategoryName;

PROMPT CQ-04: Which customers have paid more in total than the average individual payment amount?
SELECT C.CustomerID, C.CustomerName, SUM(P.Amount) AS TotalPaid
FROM CUSTOMER C
JOIN SALE S ON C.CustomerID = S.CustomerID
JOIN PAYMENT P ON S.SaleID = P.SaleID
GROUP BY C.CustomerID, C.CustomerName
HAVING SUM(P.Amount) > (SELECT AVG(Amount) FROM PAYMENT)
ORDER BY TotalPaid DESC;

PROMPT CQ-05: Which three products have the highest selling prices, and what are their categories and reorder levels?
SELECT ProductID, ProductName, CategoryName, SellingPrice, ReorderLevel
FROM (
    SELECT P.ProductID, P.ProductName, C.CategoryName, P.SellingPrice, I.ReorderLevel,
           ROW_NUMBER() OVER (ORDER BY P.SellingPrice DESC, P.ProductID) AS PricePosition
    FROM PRODUCT P
    JOIN CATEGORY C ON P.CategoryID = C.CategoryID
    JOIN INVENTORY I ON P.ProductID = I.ProductID
)
WHERE PricePosition <= 3
ORDER BY PricePosition;

PROMPT CQ-06: Which sales have payment amounts greater than the average payment, and who were the customers and clerks?
SELECT S.SaleID, C.CustomerName, K.ClerkName, P.Amount, P.PaymentMethod
FROM SALE S
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
JOIN PAYMENT P ON S.SaleID = P.SaleID
WHERE P.Amount > (SELECT AVG(Amount) FROM PAYMENT)
ORDER BY P.Amount DESC;

PROMPT CQ-07: How many stock receipts are recorded for each supplier, and how do the suppliers rank by receipt count?
SELECT S.SupplierID, S.SupplierName,
       COUNT(R.ReceiptID) AS ReceiptCount,
       RANK() OVER (ORDER BY COUNT(R.ReceiptID) DESC) AS ReceiptRank
FROM SUPPLIER S
LEFT JOIN STOCK_RECEIPT R ON S.SupplierID = R.SupplierID
GROUP BY S.SupplierID, S.SupplierName
ORDER BY ReceiptRank, S.SupplierID;

PROMPT CQ-08: How many sales occurred each month, and what were the total tax and order discounts?
SELECT TO_CHAR(TRUNC(S.SaleDateTime, 'MM'), 'YYYY-MM') AS SalesMonth,
       COUNT(S.SaleID) AS TotalSales,
       SUM(S.TaxAmount) AS TotalTax,
       SUM(S.OrderDiscountAmount) AS TotalDiscount
FROM SALE S
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
GROUP BY TRUNC(S.SaleDateTime, 'MM')
ORDER BY TRUNC(S.SaleDateTime, 'MM');

PROMPT CQ-09: Which payment methods have the highest total payment value, and how many customers used each method?
SELECT P.PaymentMethod,
       COUNT(P.PaymentID) AS PaymentCount,
       COUNT(DISTINCT C.CustomerID) AS CustomerCount,
       SUM(P.Amount) AS TotalAmount,
       ROUND(AVG(P.Amount), 2) AS AverageAmount
FROM PAYMENT P
JOIN SALE S ON P.SaleID = S.SaleID
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
GROUP BY P.PaymentMethod
ORDER BY TotalAmount DESC;

PROMPT CQ-10: Which sales received the largest order discounts, and which customers and clerks were associated with them?
SELECT S.SaleID, C.CustomerName, K.ClerkName, S.OrderDiscountAmount,
       RANK() OVER (ORDER BY S.OrderDiscountAmount DESC) AS DiscountRank
FROM SALE S
JOIN CUSTOMER C ON S.CustomerID = C.CustomerID
JOIN CLERK K ON S.ClerkID = K.ClerkID
ORDER BY DiscountRank, S.SaleID;

PROMPT All Demonstration Queries Executed Successfully.
