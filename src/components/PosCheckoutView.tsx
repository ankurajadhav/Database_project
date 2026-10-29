import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Receipt as ReceiptIcon,
  Download,
  ShoppingBag,
  CreditCard,
  User,
  BadgePercent,
  ScanBarcode
} from 'lucide-react';
import { Product, Category, Customer, Clerk, Sale } from '../types/index.ts';
import { downloadReceipt } from '../utils/receiptGenerator.ts';

interface CartItem {
  product: Product;
  quantity: number;
  lineDiscount: number;
}

interface PosCheckoutViewProps {
  products: Product[];
  categories?: Category[];
  customers: Customer[];
  clerks: Clerk[];
  onSaleCompleted: (sale: Sale) => void;
  onOpenReceipt?: (sale: Sale) => void;
  onOpenNewCustomer?: () => void;
  latestCustomerId?: number | null;
  onOpenNewClerk?: () => void;
  latestClerkId?: number | null;
}

export const PosCheckoutView: React.FC<PosCheckoutViewProps> = ({
  products,
  categories = [],
  customers,
  clerks,
  onSaleCompleted,
  onOpenReceipt,
  onOpenNewCustomer,
  latestCustomerId,
  onOpenNewClerk,
  latestClerkId
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.customerId || 1);
  const [selectedClerkId, setSelectedClerkId] = useState<number>(clerks[0]?.clerkId || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    if (selectedCategory !== 'ALL' && categories.length > 0 && !categories.some(c => c.categoryId === selectedCategory)) {
      setSelectedCategory('ALL');
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (customers.length > 0 && !customers.some(c => c.customerId === selectedCustomerId)) {
      setSelectedCustomerId(customers[0].customerId);
    }
    if (clerks.length > 0 && !clerks.some(k => k.clerkId === selectedClerkId)) {
      setSelectedClerkId(clerks[0].clerkId);
    }
  }, [customers, clerks, selectedCustomerId, selectedClerkId]);

  const lastAppliedCustomerIdRef = useRef<number | null>(null);
  const lastAppliedClerkIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      latestCustomerId &&
      latestCustomerId !== lastAppliedCustomerIdRef.current &&
      customers.some(c => c.customerId === latestCustomerId)
    ) {
      lastAppliedCustomerIdRef.current = latestCustomerId;
      setSelectedCustomerId(latestCustomerId);
    }
  }, [latestCustomerId, customers]);

  useEffect(() => {
    if (
      latestClerkId &&
      latestClerkId !== lastAppliedClerkIdRef.current &&
      clerks.some(k => k.clerkId === latestClerkId)
    ) {
      lastAppliedClerkIdRef.current = latestClerkId;
      setSelectedClerkId(latestClerkId);
    }
  }, [latestClerkId, clerks]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('UPI');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedCustomer = customers.find(c => c.customerId === selectedCustomerId);
  const selectedClerk = clerks.find(k => k.clerkId === selectedClerkId);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.productId === product.productId);
      if (existing) {
        return prev.map(item =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, lineDiscount: 0 }];
    });
    setErrorMessage(null);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        const maxDiscount = newQty * item.product.sellingPrice;
        return {
          ...item,
          quantity: newQty,
          lineDiscount: Math.min(item.lineDiscount, maxDiscount)
        };
      }
      return item;
    }));
  };

  const updateLineDiscount = (productId: number, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.productId === productId) {
        const gross = item.quantity * item.product.sellingPrice;
        const validDiscount = Math.max(0, Math.min(discount, gross));
        return { ...item, lineDiscount: validDiscount };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.productId !== productId));
  };

  // Authoritative dynamic calculations
  const grossSubtotal = cart.reduce((acc, it) => acc + (it.quantity * it.product.sellingPrice), 0);
  const lineDiscountTotal = cart.reduce((acc, it) => acc + it.lineDiscount, 0);
  const netSubtotal = grossSubtotal - lineDiscountTotal;
  const taxAmount = Number(((netSubtotal * taxPercent) / 100).toFixed(2));
  const finalPayable = Math.max(0, Number((netSubtotal - orderDiscount + taxAmount).toFixed(2)));

  // Checkout submission
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage('Please add at least one product to the checkout cart.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        customerId: selectedCustomerId,
        clerkId: selectedClerkId,
        taxAmount,
        orderDiscountAmount: orderDiscount,
        items: cart.map(it => ({
          productId: it.product.productId,
          quantitySold: it.quantity,
          lineDiscount: it.lineDiscount
        })),
        payment: {
          amount: finalPayable,
          paymentMethod
        }
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      setSuccessSale(data.sale);
      onSaleCompleted(data.sale);
      setCart([]);
      setOrderDiscount(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Point of Sale (POS) Terminal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic sales processing · Row-level inventory locking · Historical price snapshot
          </p>
        </div>
        {(onOpenNewCustomer || onOpenNewClerk) && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onOpenNewCustomer && (
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Customer</span>
              </button>
            )}
            {onOpenNewClerk && (
              <button
                type="button"
                onClick={onOpenNewClerk}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Clerk</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error / Alert Display */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transaction Aborted (Rollback Executed):</span>
            <div className="mt-0.5 font-mono text-[11px]">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Success Receipt Banner */}
      {successSale && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Sale #{successSale.saleId} Committed Successfully!</span>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Paid: ₹{(successSale.totalPaid || 0).toFixed(2)} via {paymentMethod} · Inventory stock balances updated atomically.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => downloadReceipt(successSale, 'txt')}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1 transition-colors shadow-xs"
              title="Download Receipt file (.txt)"
            >
              <Download className="w-3 h-3" />
              <span>Download Receipt</span>
            </button>
            {onOpenReceipt && (
              <button
                onClick={() => onOpenReceipt(successSale)}
                className="px-2.5 py-1.5 text-[11px] font-medium border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded flex items-center gap-1 transition-colors"
                title="View formatted receipt modal"
              >
                <ReceiptIcon className="w-3 h-3" />
                <span>View Receipt</span>
              </button>
            )}
            <button
              onClick={() => setSuccessSale(null)}
              className="px-2 py-1.5 text-[11px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Terminal Split: Left (Catalog) & Right (Register) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): Product Catalog & Barcode Scanner */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded p-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products or scan barcode (e.g. BC10001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map(product => {
              const inStock = (product.quantityOnHand || 0) > 0;
              const isLow = (product.quantityOnHand || 0) <= (product.reorderLevel || 0);

              return (
                <div
                  key={product.productId}
                  className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <ScanBarcode className="w-3 h-3" />
                        {product.barcode || `P#${product.productId}`}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        !inStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isLow
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-slate-500'
                      }`}>
                        Stock: {product.quantityOnHand} {product.unit}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 mt-1.5 line-clamp-1">
                      {product.productName}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      {product.categoryName}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      ₹{product.sellingPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!inStock}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors ${
                        inStock
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (5 Cols): Active Checkout Cart & Register */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-4 shadow-xs space-y-4">
          
          {/* Customer & Clerk Selection */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Customer
                </label>
                {onOpenNewCustomer && (
                  <button
                    type="button"
                    onClick={onOpenNewCustomer}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New</span>
                  </button>
                )}
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2 text-slate-900 focus:outline-none"
              >
                {customers.map(c => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName} ({c.loyaltyPoints} pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-500">
                  Attendant Clerk
                </label>
                {onOpenNewClerk && (
                  <button
                    type="button"
                    onClick={onOpenNewClerk}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New</span>
                  </button>
                )}
              </div>
              <select
                value={selectedClerkId}
                onChange={(e) => setSelectedClerkId(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2 text-slate-900 focus:outline-none"
              >
                {clerks.map(k => (
                  <option key={k.clerkId} value={k.clerkId}>
                    {k.clerkName} ({k.shift})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                Cart Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                Cart is empty. Select products from the catalog.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {cart.map(item => {
                  const lineGross = item.quantity * item.product.sellingPrice;
                  const lineNet = lineGross - item.lineDiscount;

                  return (
                    <div
                      key={item.product.productId}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded flex flex-col gap-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-slate-900">{item.product.productName}</span>
                          <span className="text-[11px] text-slate-500 font-mono ml-2">
                            ₹{item.product.sellingPrice.toFixed(2)} / {item.product.unit}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          ₹{lineNet.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-200 bg-white rounded">
                          <button
                            onClick={() => updateQuantity(item.product.productId, -1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-medium text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.productId, 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Discount Input */}
                        <div className="flex items-center gap-1 text-slate-600">
                          <span>Disc: ₹</span>
                          <input
                            type="number"
                            min="0"
                            max={lineGross}
                            value={item.lineDiscount}
                            onChange={(e) => updateLineDiscount(item.product.productId, parseFloat(e.target.value) || 0)}
                            className="w-12 px-1 py-0.5 border border-slate-200 bg-white rounded font-mono text-center text-xs"
                          />
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product.productId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calculations Ledger */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span className="font-mono tabular-nums">₹{grossSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Line Discounts:</span>
              <span className="font-mono text-emerald-700 tabular-nums">-₹{lineDiscountTotal.toFixed(2)}</span>
            </div>
            
            {/* Order Discount Adjustment */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <BadgePercent className="w-3 h-3 text-slate-400" />
                Order Discount:
              </span>
              <div className="flex items-center gap-1">
                <span>-₹</span>
                <input
                  type="number"
                  min="0"
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-14 px-1.5 py-0.5 border border-slate-200 bg-slate-50 rounded font-mono text-right text-xs"
                />
              </div>
            </div>

            {/* Tax Adjustment */}
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax Rate ({taxPercent}%):</span>
              <div className="flex items-center gap-2">
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={18}>18%</option>
                </select>
                <span className="font-mono tabular-nums">₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="font-mono text-base tabular-nums">₹{finalPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
              Tender Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Card'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Atomic Commit Action */}
          <button
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className={`w-full py-2.5 text-xs font-bold rounded text-white transition-all shadow-sm flex items-center justify-center gap-1.5 ${
              isSubmitting || cart.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isSubmitting ? 'Committing Transaction...' : `Complete Sale & Pay ₹${finalPayable.toFixed(2)}`}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
