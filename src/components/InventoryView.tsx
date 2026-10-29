import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Check, 
  CheckCircle2,
  Clock, 
  Layers, 
  Tag,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { Product, Category } from '../types/index.ts';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onProductAdded: (prod: Product) => void;
  onCategoryAdded?: (cat: Category) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  onProductAdded,
  onCategoryAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [newCategoryId, setNewCategoryId] = useState<number>(categories[0]?.categoryId || 1);
  const [newBarcode, setNewBarcode] = useState('');
  const [newInitialQty, setNewInitialQty] = useState('20');
  const [newReorderLevel, setNewReorderLevel] = useState('10');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    if (selectedCategory !== 'ALL' && !categories.some(c => c.categoryId === selectedCategory)) {
      setSelectedCategory('ALL');
    }
    if (categories.length > 0 && !categories.some(c => c.categoryId === newCategoryId)) {
      setNewCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategory, newCategoryId]);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesLowStock = !showLowStockOnly || ((p.quantityOnHand || 0) <= (p.reorderLevel || 0));
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter(p => (p.quantityOnHand || 0) <= (p.reorderLevel || 0)).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProductName.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    const price = parseFloat(newSellingPrice);
    if (isNaN(price) || price < 0) {
      setFormError('Selling price must be a non-negative number.');
      return;
    }

    setIsSaving(true);
    try {
      const parsedQty = parseInt(newInitialQty, 10);
      const parsedReorder = parseInt(newReorderLevel, 10);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: newProductName.trim(),
          sellingPrice: price,
          unit: newUnit,
          categoryId: newCategoryId,
          barcode: newBarcode.trim() || null,
          quantityOnHand: Number.isNaN(parsedQty) ? 0 : parsedQty,
          reorderLevel: Number.isNaN(parsedReorder) ? 10 : parsedReorder
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      onProductAdded(data);
      setIsAddModalOpen(false);
      setNewProductName('');
      setNewSellingPrice('');
      setNewBarcode('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError(null);

    if (!newCategoryName.trim()) {
      setCategoryFormError('Category Name is required.');
      return;
    }

    setIsSavingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: newCategoryName.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      if (onCategoryAdded) {
        onCategoryAdded(data);
      }
      setNewCategoryId(data.categoryId);
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
      setAlertMessage(`Category "${data.categoryName}" (#${data.categoryId}) added to database.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCategoryFormError(message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict 1:1 Product-to-Inventory mapping · Reorder level auditing · PL/SQL function price classification
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setCategoryFormError(null);
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Categories</span>
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {alertMessage && (
        <div className="p-3 rounded text-xs flex items-center justify-between gap-2.5 border bg-emerald-50 text-emerald-900 border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono text-[11px]">{alertMessage}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white border border-slate-200 rounded p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by product name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
              showLowStockOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Filter ({lowStockCount})</span>
          </button>

        </div>
      </div>

      {/* Main Relational Table View */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Barcode</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">On Hand</th>
                <th className="py-2.5 px-3 text-right">Reorder Level</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = (p.quantityOnHand || 0) <= (p.reorderLevel || 0);

                return (
                  <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-medium">
                      #{p.productId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 flex items-center gap-1">
                      <BarcodeIcon className="w-3 h-3 text-slate-400" />
                      {p.barcode || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {p.productName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.categoryName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{p.sellingPrice.toFixed(2)} / {p.unit}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                      isLow ? 'text-amber-700' : 'text-slate-900'
                    }`}>
                      {p.quantityOnHand} {p.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {p.reorderLevel}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Reorder Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Adequate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Retail Product</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almonds"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Unit of Measure</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50"
                  >
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                    <option value="packet">packet</option>
                    <option value="bottle">bottle</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Category</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50"
                  >
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Barcode (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Initial Stock (QtyOnHand)</label>
                  <input
                    type="number"
                    min="0"
                    value={newInitialQty}
                    onChange={(e) => setNewInitialQty(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Reorder Level Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={newReorderLevel}
                    onChange={(e) => setNewReorderLevel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isSaving ? 'Saving...' : 'Create in Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Category</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {categoryFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-xs text-rose-700">
                {categoryFormError}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Spices"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isSavingCategory ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
