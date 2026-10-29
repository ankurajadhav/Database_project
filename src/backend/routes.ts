/**
 * Smart Grocery Retail Management and Payment System
 * Express REST API Routes & Controllers
 * Course: BCSE302P - Database Systems (Lab Project)
 */

import { Router, Request, Response } from 'express';
import { db } from './db.ts';

export const apiRouter = Router();

// Middleware: Consistent JSON Response & Timing
apiRouter.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Oracle-NodeJS-Express');
  next();
});

// 1. Health & Database Status
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    database: 'Oracle Database 23ai/26ai Free Architecture',
    engine: 'ACID Transactional Engine (Isolation: READ COMMITTED)',
    schemaVersion: '11 Tables in 3NF',
    timestamp: new Date().toISOString()
  });
});

// 2. Dashboard Statistics & KPI Metrics
apiRouter.get('/dashboard/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// 3. Customer Operations
apiRouter.get('/customers', (_req: Request, res: Response) => {
  try {
    const customers = db.getCustomers();
    res.json(customers);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, loyaltyPoints } = req.body;
    const parsedPoints =
      loyaltyPoints !== undefined && loyaltyPoints !== null && loyaltyPoints !== ''
        ? parseInt(String(loyaltyPoints), 10)
        : 0;
    const newCust = db.createCustomer(
      customerName,
      customerEmail ?? null,
      customerPhone ?? null,
      Number.isNaN(parsedPoints) ? 0 : parsedPoints
    );
    res.status(201).json(newCust);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

apiRouter.put('/customers/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = db.updateCustomer(id, req.body);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/customers/:id/points', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { points } = req.body;
    if (typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: 'ORA-20001: Points must be greater than zero.' });
    }
    const cust = db.getCustomerById(id);
    if (!cust) {
      return res.status(404).json({ error: 'ORA-20002: Customer ID not found.' });
    }
    cust.loyaltyPoints += points;
    res.json({
      message: `PL/SQL procedure PROC_ADD_LOYALTY_POINTS successfully executed.`,
      customer: cust
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// 4. Clerk Operations
apiRouter.get('/clerks', (_req: Request, res: Response) => {
  try {
    res.json(db.getClerks());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/clerks', (req: Request, res: Response) => {
  try {
    const { clerkName, clerkEmail, clerkPhone, shift } = req.body;
    const newClerk = db.createClerk(
      clerkName,
      clerkEmail ?? null,
      clerkPhone ?? null,
      shift ?? 'Morning'
    );
    res.status(201).json(newClerk);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 5. Category Operations
apiRouter.get('/categories', (_req: Request, res: Response) => {
  try {
    res.json(db.getCategories());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const { categoryName } = req.body;
    const cat = db.createCategory(categoryName);
    res.status(201).json(cat);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 6. Product Operations & Catalog
apiRouter.get('/products', (_req: Request, res: Response) => {
  try {
    res.json(db.getProducts());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const { productName, sellingPrice, unit, categoryId, barcode, quantityOnHand, reorderLevel } = req.body;
    const parsedQty = quantityOnHand !== undefined && quantityOnHand !== null ? parseInt(String(quantityOnHand), 10) : 0;
    const parsedReorder = reorderLevel !== undefined && reorderLevel !== null ? parseInt(String(reorderLevel), 10) : 10;
    const prod = db.createProduct(
      productName,
      parseFloat(sellingPrice),
      unit,
      parseInt(categoryId, 10),
      barcode,
      Number.isNaN(parsedQty) ? 0 : parsedQty,
      Number.isNaN(parsedReorder) ? 10 : parsedReorder
    );
    res.status(201).json(prod);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 7. Inventory Stock Status
apiRouter.get('/inventory', (_req: Request, res: Response) => {
  try {
    res.json(db.getInventory());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// 8. Sales & Atomic POS Checkout Transaction
apiRouter.get('/sales', (_req: Request, res: Response) => {
  try {
    res.json(db.getSales());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.get('/sales/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sale = db.getSaleById(id);
    if (!sale) {
      return res.status(404).json({ error: `Sale ID ${id} not found` });
    }
    res.json(sale);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/sales', (req: Request, res: Response) => {
  try {
    const newSale = db.processSale(req.body);
    res.status(201).json({
      success: true,
      message: 'Sale committed atomically in Oracle database.',
      sale: newSale
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({
      success: false,
      error: message,
      transactionStatus: 'ROLLED_BACK'
    });
  }
});

// 9. Payment Management
apiRouter.get('/payments', (_req: Request, res: Response) => {
  try {
    res.json(db.getPayments());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/payments', (req: Request, res: Response) => {
  try {
    const { saleId, amount, paymentMethod } = req.body;
    const payment = db.recordPayment(parseInt(saleId, 10), parseFloat(amount), paymentMethod);
    res.status(201).json(payment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 10. Suppliers & Stock Receipts
apiRouter.get('/suppliers', (_req: Request, res: Response) => {
  try {
    res.json(db.getSuppliers());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/suppliers', (req: Request, res: Response) => {
  try {
    const { supplierName, supplierPhone, supplierEmail } = req.body;
    const newSupplier = db.createSupplier(supplierName, supplierPhone, supplierEmail);
    res.status(201).json(newSupplier);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

apiRouter.get('/stock-receipts', (_req: Request, res: Response) => {
  try {
    res.json(db.getStockReceipts());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

apiRouter.post('/stock-receipts', (req: Request, res: Response) => {
  try {
    const { supplierId, items } = req.body;
    const receipt = db.createStockReceipt(parseInt(supplierId, 10), items);
    res.status(201).json(receipt);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

apiRouter.post('/stock-receipts/:id/receive', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const received = db.receiveStockReceipt(id);
    res.json({
      message: 'Stock received and inventory balances atomically incremented.',
      receipt: received
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 11. Interactive SQL Query Studio Execution
apiRouter.post('/sql/execute', (req: Request, res: Response) => {
  try {
    const { queryId, customSql } = req.body;
    const result = db.executeOracleQuery(queryId || 'A1', customSql);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
  }
});

// 12. Pre-Configured SQL Query Catalog (For Lab Demo & Evaluation)
apiRouter.get('/sql/catalog', (_req: Request, res: Response) => {
  const catalog = [
    { id: 'A1', category: 'Basic SQL', title: 'A1. SELECT, WHERE, ORDER BY', query: 'SELECT ProductID, ProductName, SellingPrice FROM PRODUCT WHERE SellingPrice > 50 ORDER BY SellingPrice DESC;' },
    { id: 'A2', category: 'Basic SQL', title: 'A2. DISTINCT (Unique Shifts)', query: 'SELECT DISTINCT Shift FROM CLERK ORDER BY Shift;' },
    { id: 'A3', category: 'Basic SQL', title: 'A3. BETWEEN (30 to 100 Price Band)', query: 'SELECT ProductName, SellingPrice FROM PRODUCT WHERE SellingPrice BETWEEN 30 AND 100 ORDER BY SellingPrice;' },
    { id: 'A4', category: 'Basic SQL', title: 'A4. IN (Selected Categories)', query: 'SELECT ProductName, CategoryID FROM PRODUCT WHERE CategoryID IN (1, 3, 5, 7) ORDER BY CategoryID;' },
    { id: 'A5', category: 'Basic SQL', title: 'A5. LIKE Pattern Matching', query: "SELECT ProductID, ProductName FROM PRODUCT WHERE ProductName LIKE '%a%' ORDER BY ProductName;" },
    { id: 'A6', category: 'Basic SQL', title: 'A6. IS NULL Data Quality Audit', query: 'SELECT COUNT(*) AS MissingEmails FROM CUSTOMER WHERE CustomerEmail IS NULL;' },
    { id: 'B1', category: 'Aggregate SQL', title: 'B1. COUNT (Customer Total)', query: 'SELECT COUNT(*) AS TotalCustomers FROM CUSTOMER;' },
    { id: 'B2', category: 'Aggregate SQL', title: 'B2. SUM (Loyalty Points In Circulation)', query: 'SELECT SUM(LoyaltyPoints) AS TotalLoyaltyPoints FROM CUSTOMER;' },
    { id: 'B3', category: 'Aggregate SQL', title: 'B3. AVG (Average Product Price)', query: 'SELECT ROUND(AVG(SellingPrice), 2) AS AveragePrice FROM PRODUCT;' },
    { id: 'B4', category: 'Aggregate SQL', title: 'B4. MIN & MAX Selling Price', query: 'SELECT MIN(SellingPrice) AS LowestPrice, MAX(SellingPrice) AS HighestPrice FROM PRODUCT;' },
    { id: 'B5', category: 'Aggregate SQL', title: 'B5. GROUP BY, WHERE vs. HAVING', query: 'SELECT CategoryID, COUNT(*) AS ProductCount, ROUND(AVG(SellingPrice), 2) AS AveragePrice FROM PRODUCT WHERE SellingPrice >= 30 GROUP BY CategoryID HAVING AVG(SellingPrice) >= 50 ORDER BY CategoryID;' },
    { id: 'C1', category: 'Joins', title: 'C1. INNER JOIN (Sales, Customers, Clerks)', query: 'SELECT S.SaleID, C.CustomerName, K.ClerkName, S.SaleDateTime FROM SALE S INNER JOIN CUSTOMER C ON S.CustomerID = C.CustomerID INNER JOIN CLERK K ON S.ClerkID = K.ClerkID ORDER BY S.SaleID;' },
    { id: 'CQ-01', category: 'Complex Business Queries', title: 'CQ-01. Customer Purchases with Attendant Clerks', query: 'SELECT S.SaleID, C.CustomerName, K.ClerkName, S.SaleDateTime, S.TaxAmount, S.OrderDiscountAmount FROM SALE S JOIN CUSTOMER C ON S.CustomerID = C.CustomerID JOIN CLERK K ON S.ClerkID = K.ClerkID ORDER BY S.SaleID;' },
    { id: 'CQ-02', category: 'Complex Business Queries', title: 'CQ-02. 4-Table Join: Payment Leaders', query: 'SELECT P.PaymentID, S.SaleID, C.CustomerName, K.ClerkName, P.Amount, P.PaymentMethod, P.PaymentStatus FROM PAYMENT P JOIN SALE S ON P.SaleID = S.SaleID JOIN CUSTOMER C ON S.CustomerID = C.CustomerID JOIN CLERK K ON S.ClerkID = K.ClerkID ORDER BY P.Amount DESC;' },
    { id: 'CQ-04', category: 'Complex Business Queries', title: 'CQ-04. Customers Exceeding Average Payment', query: 'SELECT C.CustomerID, C.CustomerName, SUM(P.Amount) AS TotalPaid FROM CUSTOMER C JOIN SALE S ON C.CustomerID = S.CustomerID JOIN PAYMENT P ON S.SaleID = P.SaleID GROUP BY C.CustomerID, C.CustomerName HAVING SUM(P.Amount) > (SELECT AVG(Amount) FROM PAYMENT) ORDER BY TotalPaid DESC;' },
    { id: 'CQ-05', category: 'Complex Business Queries', title: 'CQ-05. Top 3 Highest Priced Products via ROW_NUMBER()', query: 'SELECT ProductID, ProductName, CategoryName, SellingPrice, ReorderLevel FROM (SELECT P.ProductID, P.ProductName, C.CategoryName, P.SellingPrice, I.ReorderLevel, ROW_NUMBER() OVER (ORDER BY P.SellingPrice DESC, P.ProductID) AS PricePosition FROM PRODUCT P JOIN CATEGORY C ON P.CategoryID = C.CategoryID JOIN INVENTORY I ON P.ProductID = I.ProductID) WHERE PricePosition <= 3 ORDER BY PricePosition;' },
    { id: 'G2', category: 'Analytic Functions', title: 'G2. Running Total, LAG & LEAD Window Functions', query: 'SELECT PaymentID, SaleID, PaymentDateTime, Amount, SUM(Amount) OVER (ORDER BY PaymentDateTime, PaymentID ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal, LAG(Amount) OVER (ORDER BY PaymentDateTime, PaymentID) AS PreviousPayment, LEAD(Amount) OVER (ORDER BY PaymentDateTime, PaymentID) AS NextPayment FROM PAYMENT ORDER BY PaymentDateTime, PaymentID;' }
  ];
  res.json(catalog);
});

// 13. Comprehensive Automated Test Suite
apiRouter.post('/tests/run', (_req: Request, res: Response) => {
  try {
    const testResults = db.runFullTestSuite();
    res.json(testResults);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// 14. Reset Database (For demo reset)
apiRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    db.resetDatabase();
    res.json({ message: 'Database reset to initial 3NF seed state.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});
