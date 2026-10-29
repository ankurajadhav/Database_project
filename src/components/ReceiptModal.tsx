import React, { useState } from 'react';
import { X, Printer, Download, Check, FileText } from 'lucide-react';
import { Sale } from '../types/index.ts';
import { downloadReceipt, generateReceiptHtml } from '../utils/receiptGenerator.ts';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!sale) return null;

  const handleDownload = (format: 'txt' | 'html') => {
    const success = downloadReceipt(sale, format);
    if (success) {
      setDownloadSuccess(`Downloaded as .${format.toUpperCase()}`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }
  };

  const handlePrint = () => {
    try {
      // If inside a sandboxed preview iframe where modal print dialogs are blocked, also save printable HTML
      if (window.self !== window.top) {
        downloadReceipt(sale, 'html');
        setDownloadSuccess('Printable receipt (.HTML) downloaded');
        setTimeout(() => setDownloadSuccess(null), 3500);
      }

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(generateReceiptHtml(sale));
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 150);
      }
    } catch (err) {
      console.warn('Direct print blocked by sandbox, downloading receipt file instead:', err);
      handleDownload('html');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white border border-slate-300 rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4">
        
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 print:hidden">
          <span className="text-xs font-semibold text-slate-700">Official Retail Receipt</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleDownload('txt')}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Download Receipt (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Download notification banner */}
        {downloadSuccess && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded flex items-center gap-2 print:hidden">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{downloadSuccess} - Saved to your downloads.</span>
          </div>
        )}

        {/* Receipt Thermal Paper Style */}
        <div className="font-mono text-xs space-y-3 text-slate-800 bg-white">
          
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
            <div className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Smart Grocery Retail
            </div>
            <div className="text-[11px] text-slate-500">
              Retail Store Outlet #01
            </div>
            <div className="text-[10px] text-slate-400">
              GSTIN: 33AAAAA0000A1Z5 · Tel: 0416-2202020
            </div>
          </div>

          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-bold">#SALE-{sale.saleId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{sale.saleDateTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.clerkName}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border-t border-b border-dashed border-slate-300 py-2">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items && sale.items.map(item => (
                  <tr key={item.saleItemId}>
                    <td className="py-1">{item.productName}</td>
                    <td className="py-1 text-center">{item.quantitySold}</td>
                    <td className="py-1 text-right">₹{item.unitPriceAtSale.toFixed(2)}</td>
                    <td className="py-1 text-right">₹{(item.netLineValue || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Gross Subtotal:</span>
              <span>₹{(sale.grossSubtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Line Discounts:</span>
              <span>-₹{(sale.lineDiscountTotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Order Discount:</span>
              <span>-₹{sale.orderDiscountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Amount:</span>
              <span>+₹{sale.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-900">
              <span>Net Amount:</span>
              <span>₹{(sale.orderPayableAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Tender Paid:</span>
              <span>₹{(sale.totalPaid || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Tender details */}
          <div className="pt-2 border-t border-dashed border-slate-300 text-[10px] text-center text-slate-500 space-y-0.5">
            <div>ACID Transaction Committed: Oracle Database</div>
            <div>Thank you for shopping with us!</div>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDownload('txt')}
              className="w-full py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
            <button
              onClick={() => handleDownload('html')}
              className="w-full py-2 px-3 text-xs font-medium border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Download (.html)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="w-full py-1.5 px-3 text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-1.5 px-3 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
