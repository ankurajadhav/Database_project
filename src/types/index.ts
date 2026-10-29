/**
 * Smart Grocery Retail Management and Payment System
 * Relational Entities, Models, and API Contracts
 * Course: BCSE302P - Database Systems (Lab Project)
 * Academic Schema: 11 Tables in Third Normal Form (3NF)
 */

export interface Customer {
  customerId: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  loyaltyPoints: number;
}

export interface Clerk {
  clerkId: number;
  clerkName: string;
  clerkEmail: string | null;
  clerkPhone: string | null;
  shift: string | null;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Product {
  productId: number;
  productName: string;
  barcode: string | null;
  sellingPrice: number;
  unit: string;
  categoryId: number;
  categoryName?: string;
  quantityOnHand?: number;
  reorderLevel?: number;
  priceLevel?: 'Low' | 'Medium' | 'High';
}

export interface Inventory {
  inventoryId: number;
  productId: number;
  quantityOnHand: number;
  reorderLevel: number;
  lastUpdated: string;
  productName?: string;
  unit?: string;
}

export interface Sale {
  saleId: number;
  saleDateTime: string;
  taxAmount: number;
  orderDiscountAmount: number;
  customerId: number;
  clerkId: number;
  customerName?: string;
  clerkName?: string;
  items?: SaleItem[];
  payments?: Payment[];
  grossSubtotal?: number;
  lineDiscountTotal?: number;
  netSubtotal?: number;
  orderPayableAmount?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  status?: 'PAID' | 'UNPAID';
}

export interface SaleItem {
  saleItemId?: number;
  saleId: number;
  productId: number;
  productName?: string;
  quantitySold: number;
  unitPriceAtSale: number;
  lineDiscount: number;
  unit?: string;
  grossLineValue?: number;
  netLineValue?: number;
}

export interface Payment {
  paymentId: number;
  saleId: number;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionRef: string;
  paymentDateTime: string;
  customerName?: string;
  clerkName?: string;
}

export interface Supplier {
  supplierId: number;
  supplierName: string;
  supplierPhone: string | null;
  supplierEmail: string | null;
}

export interface StockReceipt {
  receiptId: number;
  receiptDate: string;
  receiptStatus: 'Received' | 'Pending' | 'Cancelled';
  supplierId: number;
  supplierName?: string;
  items?: StockReceiptItem[];
  totalCost?: number;
}

export interface StockReceiptItem {
  receiptItemId?: number;
  receiptId: number;
  productId: number;
  productName?: string;
  qtyReceived: number;
  purchaseUnitCost: number;
  lineTotal?: number;
}

export interface DashboardStats {
  todaySalesCount: number;
  todaySalesAmount: number;
  totalCompletedPayments: number;
  outstandingBalance: number;
  totalProductsCount: number;
  lowStockItemsCount: number;
  totalCustomersCount: number;
  recentSales: Sale[];
  topSellingProducts: {
    productId: number;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }[];
  recentReceipts: StockReceipt[];
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
  sql: string;
  plan?: string;
  explanation?: string;
}

export interface PlSqlResult {
  procedureName: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  dbmsOutput: string[];
  executionTimeMs: number;
  modifiedData?: unknown;
}

export interface TestCaseResult {
  id: string;
  title: string;
  category: 'CONSTRAINTS' | 'TRANSACTIONS' | 'TRIGGERS' | 'SECURITY' | 'PROCEDURES' | 'BUSINESS';
  preconditions: string;
  inputDescription: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASSED' | 'FAILED';
  executionTimeMs: number;
  log?: string;
}
