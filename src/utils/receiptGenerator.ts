/**
 * Receipt Generation & Download Utilities
 * Generates formatted thermal text and HTML receipts for grocery retail sales.
 */

import { Sale } from '../types/index.ts';

export function generateReceiptText(sale: Sale): string {
  const lineItems = (sale.items || [])
    .map(item => {
      const name = (item.productName || 'Product').padEnd(20).slice(0, 20);
      const qty = String(item.quantitySold).padStart(4);
      const price = ('₹' + item.unitPriceAtSale.toFixed(2)).padStart(9);
      const total = ('₹' + (item.netLineValue || 0).toFixed(2)).padStart(10);
      return `${name} ${qty} ${price} ${total}`;
    })
    .join('\n');

  const payments = (sale.payments || [])
    .map(p => `  • ₹${p.amount.toFixed(2)} via ${p.paymentMethod} [${p.paymentStatus}] - Ref: ${p.transactionRef}`)
    .join('\n');

  return `================================================
           SMART GROCERY RETAIL
          Retail Store Outlet #01
    GSTIN: 33AAAAA0000A1Z5 · Tel: 0416-2202020
================================================
INVOICE NO:  #SALE-${sale.saleId}
DATE & TIME: ${sale.saleDateTime}
CUSTOMER:    ${sale.customerName}
CASHIER:     ${sale.clerkName}
------------------------------------------------
ITEM                 QTY     PRICE      TOTAL
------------------------------------------------
${lineItems || 'No line items recorded'}
------------------------------------------------
Gross Subtotal:             ₹${(sale.grossSubtotal || 0).toFixed(2)}
Line Discounts:            -₹${(sale.lineDiscountTotal || 0).toFixed(2)}
Order Discount:            -₹${sale.orderDiscountAmount.toFixed(2)}
Tax Amount (CGST+SGST):    +₹${sale.taxAmount.toFixed(2)}
------------------------------------------------
NET PAYABLE AMOUNT:         ₹${(sale.orderPayableAmount || 0).toFixed(2)}
TOTAL PAID:                 ₹${(sale.totalPaid || 0).toFixed(2)}
PAYMENT STATUS:             ${sale.status || 'PAID'}
------------------------------------------------
PAYMENT TENDER BREAKDOWN:
${payments || '  • No tender records found'}
------------------------------------------------
ACID Transaction: COMMITTED (Oracle Database Engine)
       Thank you for shopping with us!
================================================
`;
}

export function generateReceiptHtml(sale: Sale): string {
  const lineRows = (sale.items || [])
    .map(
      item => `
      <tr>
        <td style="padding: 4px 0; text-align: left;">${item.productName || 'Product'}</td>
        <td style="padding: 4px 0; text-align: center;">${item.quantitySold}</td>
        <td style="padding: 4px 0; text-align: right;">₹${item.unitPriceAtSale.toFixed(2)}</td>
        <td style="padding: 4px 0; text-align: right;">₹${(item.netLineValue || 0).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt #SALE-${sale.saleId} - Smart Grocery Retail</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #111;
      background: #f8fafc;
      display: flex;
      justify-content: center;
      padding: 24px;
      margin: 0;
    }
    .ticket {
      width: 320px;
      background: #fff;
      padding: 16px;
      border: 1px dashed #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #94a3b8;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .header h2 {
      margin: 0 0 4px 0;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .meta {
      font-size: 11px;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px dashed #94a3b8;
      border-bottom: 1px dashed #94a3b8;
      margin: 8px 0;
    }
    th {
      font-size: 11px;
      padding: 6px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals {
      font-size: 11px;
      line-height: 1.6;
      margin: 10px 0;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
    }
    .totals .grand {
      font-weight: bold;
      font-size: 13px;
      border-top: 1px solid #000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px dashed #94a3b8;
      padding-top: 8px;
      margin-top: 12px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .ticket { border: none; box-shadow: none; width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <h2>SMART GROCERY RETAIL</h2>
      <div>Retail Store Outlet #01</div>
      <div style="font-size: 10px; color: #64748b;">GSTIN: 33AAAAA0000A1Z5 · Tel: 0416-2202020</div>
    </div>
    <div class="meta">
      <div><strong>Invoice:</strong> #SALE-${sale.saleId}</div>
      <div><strong>Date:</strong> ${sale.saleDateTime}</div>
      <div><strong>Customer:</strong> ${sale.customerName}</div>
      <div><strong>Cashier:</strong> ${sale.clerkName}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
      </tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Gross Subtotal:</span><span>₹${(sale.grossSubtotal || 0).toFixed(2)}</span></div>
      <div class="row"><span>Line Discounts:</span><span>-₹${(sale.lineDiscountTotal || 0).toFixed(2)}</span></div>
      <div class="row"><span>Order Discount:</span><span>-₹${sale.orderDiscountAmount.toFixed(2)}</span></div>
      <div class="row"><span>Tax Amount:</span><span>+₹${sale.taxAmount.toFixed(2)}</span></div>
      <div class="row grand"><span>Net Payable:</span><span>₹${(sale.orderPayableAmount || 0).toFixed(2)}</span></div>
      <div class="row" style="color: #047857; font-weight: bold;"><span>Total Paid:</span><span>₹${(sale.totalPaid || 0).toFixed(2)}</span></div>
    </div>
    <div class="footer">
      <div>Status: ${sale.status || 'PAID'} · ACID Committed</div>
      <div>Thank you for shopping with us!</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a file to user's computer via browser Blob
 */
export function downloadReceipt(sale: Sale, format: 'txt' | 'html' = 'txt'): boolean {
  try {
    const isTxt = format === 'txt';
    const content = isTxt ? generateReceiptText(sale) : generateReceiptHtml(sale);
    const mimeType = isTxt ? 'text/plain;charset=utf-8' : 'text/html;charset=utf-8';
    const extension = isTxt ? 'txt' : 'html';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-SALE-${sale.saleId}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 150);

    return true;
  } catch (err) {
    console.error('Failed to trigger receipt download:', err);
    return false;
  }
}
