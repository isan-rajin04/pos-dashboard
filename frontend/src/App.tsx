import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Plus, Trash2, Edit, Search, LayoutDashboard,
  ShoppingCart, Users, Download, TrendingUp, Moon, Sun,
  AlertTriangle, RefreshCw, Tag, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const API_URL = 'http://localhost:3000/api/products';
const STATS_URL = 'http://localhost:3000/api/stats';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

interface Stats {
  totalValue: number;
  totalProducts: number;
  chartData: { name: string; value: number }[];
}

type SortKey = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const fetchProducts = async (q = '') => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}?search=${q}`);
      if (res.data.success) setProducts(res.data.data);
    } catch {
      toast.error('Gagal mengambil data produk');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(STATS_URL);
      if (res.data.success) setStats(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchProducts(); fetchStats(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: parseFloat(price), stock: parseInt(stock), category: category || 'Uncategorized' };
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        toast.success('Produk berhasil diperbarui! ✏️');
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload);
        toast.success('Produk berhasil ditambahkan! 🎉');
      }
      resetForm();
      fetchProducts();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Produk berhasil dihapus 🗑️');
      setConfirmDeleteId(null);
      fetchProducts();
      fetchStats();
    } catch {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleEdit = (product: Product) => {
    setName(product.name); setPrice(product.price.toString());
    setStock(product.stock.toString()); setCategory(product.category || '');
    setEditingId(product.id); setActiveTab('products');
    setTimeout(() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const resetForm = () => { setName(''); setPrice(''); setStock(''); setCategory(''); setEditingId(null); };

  const exportToCSV = () => {
    const header = ['ID', 'Nama', 'Kategori', 'Harga', 'Stok', 'Nilai Inventaris'].join(',');
    const rows = filteredSorted.map(p => [p.id, `"${p.name}"`, `"${p.category}"`, p.price, p.stock, p.price * p.stock].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventaris_export.csv'; a.click();
    toast.success('Export CSV berhasil! 📥');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const filteredSorted = [...products]
    .filter(p => !selectedCategory || p.category === selectedCategory)
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'price') return (a.price - b.price) * dir;
      if (sortKey === 'stock') return (a.stock - b.stock) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />)
    : null;

  const getStockBadge = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    if (stock <= 5) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
    if (stock <= 20) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
  };

  // ── Dashboard Tab ──────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400">⚠️ Stok Hampir Habis!</p>
            <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
              {lowStockProducts.map(p => <span key={p.id} className="inline-block bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{p.name} ({p.stock})</span>)}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: 'Total Produk', value: stats?.totalProducts || 0, icon: <Package size={22} />, color: 'blue', sub: `${categories.length} kategori` },
          { label: 'Total Nilai Inventaris', value: `Rp ${(stats?.totalValue || 0).toLocaleString('id-ID')}`, icon: <TrendingUp size={22} />, color: 'emerald', sub: 'Semua stok' },
          { label: 'Stok Kritis', value: lowStockProducts.length, icon: <AlertTriangle size={22} />, color: 'orange', sub: 'Perlu restock' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl bg-${c.color}-50 dark:bg-${c.color}-900/30 text-${c.color}-600 dark:text-${c.color}-400`}>{c.icon}</div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{c.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-5">📊 Nilai Inventaris per Kategori</h2>
          <div className="h-60">
            {stats?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis dataKey="name" tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / 0.15)', background: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#111' }}
                    formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Nilai']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.chartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">Belum ada data</p>}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-5">🥧 Distribusi Kategori</h2>
          <div className="h-60">
            {stats?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {stats.chartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', background: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#111' }}
                    formatter={(val: number) => [`Rp ${val.toLocaleString('id-ID')}`, 'Nilai']}
                  />
                  <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">Belum ada data</p>}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">🏆 Top 5 Produk (Nilai Tertinggi)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                <th className="p-4">#</th>
                <th className="p-4">Produk</th>
                <th className="p-4 text-right">Harga</th>
                <th className="p-4 text-right">Stok</th>
                <th className="p-4 text-right">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {[...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 5).map((p, i) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                  <td className="p-4 text-gray-400 dark:text-gray-500 font-bold text-sm">#{i + 1}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{p.category}</p>
                  </td>
                  <td className="p-4 text-right text-sm text-gray-600 dark:text-gray-400">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStockBadge(p.stock)}`}>{p.stock}</span></td>
                  <td className="p-4 text-right text-sm font-semibold text-gray-800 dark:text-white">Rp {(p.price * p.stock).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Products Tab ───────────────────────────────────────────────────────────
  const renderProducts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div id="product-form" className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">{editingId ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nama Produk', value: name, setter: setName, type: 'text', placeholder: 'cth. Kampas Rem Honda', required: true },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
              <input required={f.required} type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
              <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok</label>
              <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="cth. Mesin, Pelumas, Roda"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border border-blue-100 dark:border-blue-800">
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
              <Plus size={18} /> {editingId ? 'Update' : 'Simpan'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98] transition-all">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Inventaris</h2>
            <div className="flex gap-2">
              <button onClick={() => { fetchProducts(search); fetchStats(); }} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition" title="Refresh">
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={exportToCSV} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition" title="Export CSV">
                <Download size={16} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition border ${!selectedCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
              <Tag size={10} /> Semua
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition border ${selectedCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                {([['name', 'Produk'], ['category', 'Kategori'], ['price', 'Harga'], ['stock', 'Stok']] as [SortKey | 'category', string][]).map(([k, label]) => (
                  <th key={k} className={`p-4 ${k !== 'name' && k !== 'category' ? 'text-right' : ''} ${k !== 'category' ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                    onClick={k !== 'category' ? () => toggleSort(k as SortKey) : undefined}>
                    {label}<SortIcon k={k as SortKey} />
                  </th>
                ))}
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400 dark:text-gray-600">
                  <Package size={40} className="mx-auto mb-3 opacity-20" /><p>Tidak ada produk ditemukan</p>
                </td></tr>
              ) : filteredSorted.map(p => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition group">
                  <td className="p-4 pl-5">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{p.name}</p>
                  </td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">{p.category || 'N/A'}</span></td>
                  <td className="p-4 text-right text-sm text-gray-600 dark:text-gray-400 font-medium">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStockBadge(p.stock)}`}>{p.stock}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"><Edit size={15} /></button>
                      <button onClick={() => setConfirmDeleteId(p.id)} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          Menampilkan {filteredSorted.length} dari {products.length} produk
        </div>
      </div>
    </div>
  );

  // ── Delete Confirm Modal ───────────────────────────────────────────────────
  const renderDeleteModal = () => confirmDeleteId && (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><Trash2 className="text-red-600 dark:text-red-400" size={20} /></div>
          <h3 className="font-bold text-gray-800 dark:text-white">Hapus Produk?</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Aksi ini tidak bisa dibatalkan. Produk akan dihapus secara permanen dari database.</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Batal</button>
          <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-300`}>
      <Toaster position="top-center" richColors />
      {renderDeleteModal()}

      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25"><ShoppingCart size={18} /></div>
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">NexPOS</h1>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
            { id: 'products', icon: <Package size={17} />, label: 'Produk' },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {icon} {label}
              {id === 'products' && lowStockProducts.length > 0 && (
                <span className="ml-auto text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{lowStockProducts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"><Users size={14} className="text-gray-500 dark:text-gray-400" /></div>
            <div className="text-sm flex-1">
              <p className="font-semibold text-gray-800 dark:text-white text-xs">Admin User</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {activeTab === 'dashboard' ? '📊 Overview' : '📦 Manage Products'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {/* Dark Mode Toggle */}
            <button onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
          {activeTab === 'dashboard' ? renderDashboard() : renderProducts()}
        </div>
      </main>
    </div>
  );
}
