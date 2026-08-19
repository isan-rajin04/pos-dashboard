import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Edit, Search, LayoutDashboard, ShoppingCart, Users, Download, TrendingUp } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_URL = 'http://localhost:3000/api/products';
const STATS_URL = 'http://localhost:3000/api/stats';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface Stats {
  totalValue: number;
  totalProducts: number;
  chartData: { name: string; value: number }[];
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchProducts = async (q = '') => {
    try {
      const res = await axios.get(`${API_URL}?search=${q}`);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(STATS_URL);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category || 'Uncategorized'
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        toast.success('Product updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload);
        toast.success('Product added successfully!');
      }
      resetForm();
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Product deleted');
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category || '');
    setEditingId(product.id);
    setActiveTab('products');
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setStock('');
    setCategory('');
    setEditingId(null);
  };

  const exportToCSV = () => {
    const header = ['ID', 'Name', 'Category', 'Price', 'Stock'].join(',');
    const rows = products.map(p => [p.id, p.name, p.category, p.price, p.stock].join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_export.csv';
    a.click();
    toast.success('Export successful');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Inventory Value</p>
            <p className="text-2xl font-bold text-gray-800">Rp {stats?.totalValue?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Inventory Value by Category</h2>
        <div className="h-72 w-full">
          {stats?.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={value => `Rp${value}`} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. Mechanical Keyboard" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
              <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. Electronics" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Inventory List</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button onClick={exportToCSV} className="p-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors" title="Export CSV">
              <Download size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-gray-800">{product.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {product.category || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-600 font-medium">Rp {product.price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${product.stock <= 5 ? 'bg-red-50 text-red-600' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans flex flex-col md:flex-row">
      <Toaster position="top-center" richColors />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ShoppingCart size={20} />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">NexPOS</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package size={18} /> Products
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
               <Users size={16} className="text-gray-500" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden relative">
        <header className="bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {activeTab === 'dashboard' ? 'Overview' : 'Manage Products'}
          </h2>
          <div className="text-sm text-gray-500 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10 translate-y-1/3 -translate-x-1/3"></div>

          {activeTab === 'dashboard' ? renderDashboard() : renderProducts()}
        </div>
      </main>
    </div>
  );
}
