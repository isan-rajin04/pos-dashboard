import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Plus, Trash2, Edit, Search, LayoutDashboard,
  ShoppingCart, Users, Download, TrendingUp, Moon, Sun,
  AlertTriangle, RefreshCw, Tag, ChevronUp, ChevronDown,
  Receipt, Minus, CreditCard, X, CheckCircle, History
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/products`;
const STATS_URL = `${API_BASE}/api/stats`;
const TRX_URL = `${API_BASE}/api/transactions`;

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

interface Product {
  id: string; name: string; price: number; stock: number; category: string; createdAt: string;
}
interface CartItem {
  product: Product; quantity: number;
}
interface TrxItem {
  id: string; productName: string; price: number; quantity: number; subtotal: number;
}
interface Transaction {
  id: string; total: number; note: string; createdAt: string; items: TrxItem[];
}
interface Stats {
  totalValue: number; totalProducts: number; chartData: { name: string; value: number }[];
  revenueChart: { name: string; value: number }[]; totalRevenue: number; totalTransactions: number;
}
type SortKey = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState(''); const [price, setPrice] = useState('');
  const [stock, setStock] = useState(''); const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Cart (Kasir)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState('');
  const [kasirSearch, setKasirSearch] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState<Transaction | null>(null);
  // Transaction history
  const [trxSearch, setTrxSearch] = useState('');
  const [expandedTrx, setExpandedTrx] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const fetchProducts = async (q = '') => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}?search=${q}`);
      if (res.data.success) setProducts(res.data.data);
    } catch { toast.error('Gagal mengambil data produk'); }
    finally { setIsLoading(false); }
  };
  const fetchStats = async () => {
    try { const res = await axios.get(STATS_URL); if (res.data.success) setStats(res.data.data); } catch {}
  };
  const fetchTransactions = async () => {
    try { const res = await axios.get(TRX_URL); if (res.data.success) setTransactions(res.data.data); } catch {}
  };

  useEffect(() => { fetchProducts(); fetchStats(); fetchTransactions(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchProducts(search), 300); return () => clearTimeout(t); }, [search]);

  // ── CRUD Handlers ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: parseFloat(price), stock: parseInt(stock), category: category || 'Uncategorized' };
    try {
      if (editingId) { await axios.put(`${API_URL}/${editingId}`, payload); toast.success('Produk diperbarui! ✏️'); setEditingId(null); }
      else { await axios.post(API_URL, payload); toast.success('Produk ditambahkan! 🎉'); }
      resetForm(); fetchProducts(); fetchStats();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Gagal menyimpan produk'); }
  };
  const handleDelete = async (id: string) => {
    try { await axios.delete(`${API_URL}/${id}`); toast.success('Produk dihapus 🗑️'); setConfirmDeleteId(null); fetchProducts(); fetchStats(); }
    catch { toast.error('Gagal menghapus produk'); }
  };
  const handleEdit = (p: Product) => {
    setName(p.name); setPrice(p.price.toString()); setStock(p.stock.toString()); setCategory(p.category || '');
    setEditingId(p.id); setActiveTab('products');
    setTimeout(() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  const resetForm = () => { setName(''); setPrice(''); setStock(''); setCategory(''); setEditingId(null); };

  // ── Cart Handlers ──────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    if (product.stock === 0) { toast.error('Stok habis!'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error(`Stok maksimal: ${product.stock}`); return prev; }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== id) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return i;
      if (newQty > i.product.stock) { toast.error(`Stok maksimal: ${i.product.stock}`); return i; }
      return { ...i, quantity: newQty };
    }));
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));
  const cartTotal = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Keranjang kosong!'); return; }
    try {
      const res = await axios.post(TRX_URL, {
        note,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      });
      if (res.data.success) {
        setCheckoutSuccess(res.data.data);
        setCart([]); setNote('');
        fetchProducts(); fetchStats(); fetchTransactions();
      }
    } catch (err: any) { toast.error(err.response?.data?.error || 'Checkout gagal'); }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const h = ['ID','Nama','Kategori','Harga','Stok','Nilai'].join(',');
    const rows = filteredSorted.map(p => [p.id,`"${p.name}"`,`"${p.category}"`,p.price,p.stock,p.price*p.stock].join(','));
    const blob = new Blob([[h,...rows].join('\n')],{type:'text/csv'});
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:'inventaris.csv'});
    a.click(); toast.success('Export CSV berhasil! 📥');
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const toggleSort = (k: SortKey) => { if (sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else {setSortKey(k);setSortDir('asc');} };
  const SortIcon = ({k}:{k:SortKey}) => sortKey===k ? (sortDir==='asc'?<ChevronUp size={12} className="inline ml-1"/>:<ChevronDown size={12} className="inline ml-1"/>):null;

  // ── Derived ────────────────────────────────────────────────────────────────
  const categories = [...new Set(products.map(p=>p.category).filter(Boolean))];
  const lowStockProducts = products.filter(p=>p.stock<=5);
  const filteredSorted = [...products]
    .filter(p=>!selectedCategory||p.category===selectedCategory)
    .sort((a,b)=>{
      const d = sortDir==='asc'?1:-1;
      if(sortKey==='name') return a.name.localeCompare(b.name)*d;
      if(sortKey==='price') return (a.price-b.price)*d;
      if(sortKey==='stock') return (a.stock-b.stock)*d;
      return (new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime())*d;
    });
  const kasirProducts = products.filter(p=>p.name.toLowerCase().includes(kasirSearch.toLowerCase()));
  const filteredTrx = transactions.filter(t=>
    t.id.includes(trxSearch) || t.items.some(i=>i.productName.toLowerCase().includes(trxSearch.toLowerCase()))
  );

  const getStockBadge=(stock:number)=>{
    if(stock===0) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    if(stock<=5) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
    if(stock<=20) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
  };

  const cls = (...c:(string|undefined|false)[]) => c.filter(Boolean).join(' ');
  const inputCls = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      {lowStockProducts.length>0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={20}/>
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400">⚠️ Stok Hampir Habis!</p>
            <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
              {lowStockProducts.map(p=><span key={p.id} className="inline-block bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{p.name} ({p.stock})</span>)}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {label:'Total Produk', value:stats?.totalProducts||0, icon:<Package size={20}/>, color:'blue', sub:`${categories.length} kategori`},
          {label:'Nilai Inventaris', value:`Rp ${((stats?.totalValue||0)/1000000).toFixed(1)}jt`, icon:<TrendingUp size={20}/>, color:'emerald', sub:'Total stok'},
          {label:'Total Omzet', value:`Rp ${((stats?.totalRevenue||0)/1000000).toFixed(1)}jt`, icon:<CreditCard size={20}/>, color:'purple', sub:'Semua transaksi'},
          {label:'Stok Kritis', value:lowStockProducts.length, icon:<AlertTriangle size={20}/>, color:'orange', sub:'Perlu restock'},
        ].map((c,i)=>(
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl bg-${c.color}-50 dark:bg-${c.color}-900/30 text-${c.color}-600 dark:text-${c.color}-400`}>{c.icon}</div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{c.label}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{c.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">📈 Omzet 7 Hari Terakhir</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.revenueChart||[]} margin={{top:5,right:5,left:-25,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode?'#374151':'#f0f0f0'}/>
                <XAxis dataKey="name" tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{borderRadius:'12px',border:'none',background:darkMode?'#1f2937':'#fff',color:darkMode?'#fff':'#111'}} formatter={(v:number)=>[`Rp ${v.toLocaleString('id-ID')}`,'Omzet']}/>
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{fill:'#3b82f6',r:4}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">🥧 Distribusi Nilai per Kategori</h2>
          <div className="h-56">
            {stats?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                    {stats.chartData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:'12px',border:'none',background:darkMode?'#1f2937':'#fff',color:darkMode?'#fff':'#111'}} formatter={(v:number)=>[`Rp ${v.toLocaleString('id-ID')}`,'Nilai']}/>
                  <Legend iconType="circle" iconSize={8} formatter={v=><span className="text-xs text-gray-500 dark:text-gray-400">{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            ):<p className="h-full flex items-center justify-center text-gray-400">Belum ada data</p>}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">📊 Nilai Inventaris per Kategori</h2>
        <div className="h-52">
          {stats?.chartData?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{top:5,right:5,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode?'#374151':'#f0f0f0'}/>
                <XAxis dataKey="name" tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:darkMode?'#9ca3af':'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{borderRadius:'12px',border:'none',background:darkMode?'#1f2937':'#fff',color:darkMode?'#fff':'#111'}} formatter={(v:number)=>[`Rp ${v.toLocaleString('id-ID')}`,'Nilai']}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>{stats.chartData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ):<p className="h-full flex items-center justify-center text-gray-400">Belum ada data</p>}
        </div>
      </div>

      {/* Top 5 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700"><h2 className="text-sm font-semibold text-gray-800 dark:text-white">🏆 Top 5 Produk (Nilai Tertinggi)</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
              <th className="p-4">#</th><th className="p-4">Produk</th><th className="p-4 text-right">Harga</th><th className="p-4 text-right">Stok</th><th className="p-4 text-right">Nilai</th>
            </tr></thead>
            <tbody>
              {[...products].sort((a,b)=>(b.price*b.stock)-(a.price*a.stock)).slice(0,5).map((p,i)=>(
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                  <td className="p-4 text-gray-400 dark:text-gray-500 font-bold text-sm">#{i+1}</td>
                  <td className="p-4"><p className="font-medium text-gray-800 dark:text-white text-sm">{p.name}</p><p className="text-xs text-gray-400">{p.category}</p></td>
                  <td className="p-4 text-right text-sm text-gray-600 dark:text-gray-400">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStockBadge(p.stock)}`}>{p.stock}</span></td>
                  <td className="p-4 text-right text-sm font-semibold text-gray-800 dark:text-white">Rp {(p.price*p.stock).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── KASIR TAB ──────────────────────────────────────────────────────────────
  const renderKasir = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Product Grid */}
      <div className="lg:col-span-3 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input type="text" placeholder="Cari produk..." value={kasirSearch} onChange={e=>setKasirSearch(e.target.value)}
            className={cls(inputCls,'pl-9')}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {kasirProducts.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock===0}
              className={cls('text-left p-4 rounded-2xl border transition-all',
                p.stock===0
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md active:scale-[0.98]'
              )}>
              <p className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">{p.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.category}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">Rp {p.price.toLocaleString('id-ID')}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStockBadge(p.stock)}`}>{p.stock===0?'Habis':`Stok: ${p.stock}`}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-fit sticky top-6">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><ShoppingCart size={18}/> Keranjang</h2>
          {cart.length>0&&<button onClick={()=>setCart([])} className="text-xs text-red-500 hover:text-red-700 transition">Kosongkan</button>}
        </div>
        <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto">
          {cart.length===0
            ? <p className="text-center text-gray-400 dark:text-gray-600 py-8 text-sm">Keranjang kosong.<br/>Klik produk untuk menambahkan.</p>
            : cart.map(i=>(
              <div key={i.product.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{i.product.name}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Rp {(i.product.price*i.quantity).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={()=>updateQty(i.product.id,-1)} className="w-6 h-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition"><Minus size={12}/></button>
                  <span className="text-sm font-bold text-gray-800 dark:text-white w-5 text-center">{i.quantity}</span>
                  <button onClick={()=>updateQty(i.product.id,1)} className="w-6 h-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition"><Plus size={12}/></button>
                  <button onClick={()=>removeFromCart(i.product.id)} className="w-6 h-6 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition ml-1"><X size={12}/></button>
                </div>
              </div>
            ))
          }
        </div>
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
          <input type="text" placeholder="Catatan (opsional)..." value={note} onChange={e=>setNote(e.target.value)} className={cls(inputCls,'text-sm')}/>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">Rp {cartTotal.toLocaleString('id-ID')}</span>
          </div>
          <button onClick={handleCheckout} disabled={cart.length===0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
            <CreditCard size={18}/> Checkout
          </button>
        </div>
      </div>
    </div>
  );

  // ── TRANSAKSI TAB ──────────────────────────────────────────────────────────
  const renderTransaksi = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input type="text" placeholder="Cari transaksi / produk..." value={trxSearch} onChange={e=>setTrxSearch(e.target.value)} className={cls(inputCls,'pl-9 text-sm')}/>
        </div>
        <button onClick={fetchTransactions} className="p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
          <RefreshCw size={16}/>
        </button>
      </div>
      {filteredTrx.length===0
        ? <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-600"><Receipt size={40} className="mx-auto mb-3 opacity-20"/><p>Belum ada transaksi</p></div>
        : filteredTrx.map(t=>(
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <button onClick={()=>setExpandedTrx(expandedTrx===t.id?null:t.id)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><CheckCircle className="text-emerald-600 dark:text-emerald-400" size={18}/></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">#{t.id.slice(0,8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.createdAt).toLocaleString('id-ID')} · {t.items.length} item</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">Rp {t.total.toLocaleString('id-ID')}</span>
                {expandedTrx===t.id?<ChevronUp size={16} className="text-gray-400"/>:<ChevronDown size={16} className="text-gray-400"/>}
              </div>
            </button>
            {expandedTrx===t.id&&(
              <div className="border-t border-gray-100 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <th className="p-3 pl-5 text-left font-semibold">Produk</th>
                    <th className="p-3 text-right font-semibold">Harga</th>
                    <th className="p-3 text-right font-semibold">Qty</th>
                    <th className="p-3 pr-5 text-right font-semibold">Subtotal</th>
                  </tr></thead>
                  <tbody>
                    {t.items.map(item=>(
                      <tr key={item.id} className="border-t border-gray-50 dark:border-gray-700/50">
                        <td className="p-3 pl-5 text-gray-700 dark:text-gray-300">{item.productName}</td>
                        <td className="p-3 text-right text-gray-500 dark:text-gray-400">Rp {item.price.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right text-gray-600 dark:text-gray-400">x{item.quantity}</td>
                        <td className="p-3 pr-5 text-right font-semibold text-gray-800 dark:text-white">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {t.note&&<p className="px-5 pb-3 text-xs text-gray-400 dark:text-gray-500 italic">Catatan: {t.note}</p>}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );

  // ── PRODUCTS TAB ───────────────────────────────────────────────────────────
  const renderProducts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div id="product-form" className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">{editingId?'✏️ Edit Produk':'➕ Tambah Produk'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
            <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="cth. Kampas Rem Honda" className={inputCls}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
              <input required type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)} className={inputCls}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok</label>
              <input required type="number" min="0" value={stock} onChange={e=>setStock(e.target.value)} className={inputCls}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <input type="text" value={category} onChange={e=>setCategory(e.target.value)} placeholder="cth. Mesin, Pelumas" className={inputCls}/>
            {categories.length>0&&<div className="flex flex-wrap gap-1 mt-2">
              {categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)}
                className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-800 transition">{c}</button>)}
            </div>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20">
              <Plus size={18}/>{editingId?'Update':'Simpan'}
            </button>
            {editingId&&<button type="button" onClick={resetForm} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98] transition-all">Batal</button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Inventaris</h2>
            <div className="flex gap-2">
              <button onClick={()=>{fetchProducts(search);fetchStats();}} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"><RefreshCw size={15} className={isLoading?'animate-spin':''}/></button>
              <button onClick={exportToCSV} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"><Download size={15}/></button>
            </div>
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/><input type="text" placeholder="Cari produk..." value={search} onChange={e=>setSearch(e.target.value)} className={cls(inputCls,'pl-9 text-sm')}/></div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={()=>setSelectedCategory(null)} className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition border ${!selectedCategory?'bg-blue-600 text-white border-blue-600':'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}><Tag size={10}/>Semua</button>
            {categories.map(c=><button key={c} onClick={()=>setSelectedCategory(c===selectedCategory?null:c)} className={`px-3 py-1 text-xs rounded-full font-medium transition border ${selectedCategory===c?'bg-blue-600 text-white border-blue-600':'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>{c}</button>)}
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
              {([['name','Produk'],['price','Harga'],['stock','Stok']] as [SortKey,string][]).map(([k,l])=>(
                <th key={k} className={`p-4 ${k!=='name'?'text-right':''} cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200`} onClick={()=>toggleSort(k)}>{l}<SortIcon k={k}/></th>
              ))}
              <th className="p-4 text-center">Aksi</th>
            </tr></thead>
            <tbody>
              {filteredSorted.length===0
                ? <tr><td colSpan={4} className="p-12 text-center text-gray-400 dark:text-gray-600"><Package size={40} className="mx-auto mb-3 opacity-20"/><p>Tidak ada produk</p></td></tr>
                : filteredSorted.map(p=>(
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition group">
                    <td className="p-4 pl-5">
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{p.name}</p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{p.category||'N/A'}</span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-600 dark:text-gray-400 font-medium">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right"><span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStockBadge(p.stock)}`}>{p.stock}</span></td>
                    <td className="p-4 text-center"><div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={()=>handleEdit(p)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"><Edit size={14}/></button>
                      <button onClick={()=>setConfirmDeleteId(p.id)} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition"><Trash2 size={14}/></button>
                    </div></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">Menampilkan {filteredSorted.length} dari {products.length} produk</div>
      </div>
    </div>
  );

  // ── DELETE MODAL ───────────────────────────────────────────────────────────
  const renderDeleteModal = () => confirmDeleteId&&(
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><Trash2 className="text-red-600 dark:text-red-400" size={20}/></div><h3 className="font-bold text-gray-800 dark:text-white">Hapus Produk?</h3></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Aksi ini tidak bisa dibatalkan. Produk akan dihapus permanen.</p>
        <div className="flex gap-3">
          <button onClick={()=>setConfirmDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Batal</button>
          <button onClick={()=>handleDelete(confirmDeleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );

  // ── CHECKOUT SUCCESS MODAL ─────────────────────────────────────────────────
  const renderSuccessModal = () => checkoutSuccess&&(
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="text-emerald-600" size={32}/></div>
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white">Transaksi Berhasil!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">#{checkoutSuccess.id.slice(0,8).toUpperCase()}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
          {checkoutSuccess.items.map(i=>(
            <div key={i.id} className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{i.productName} x{i.quantity}</span><span className="font-medium text-gray-800 dark:text-white">Rp {i.subtotal.toLocaleString('id-ID')}</span></div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-extrabold text-base">
            <span className="text-gray-800 dark:text-white">Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">Rp {checkoutSuccess.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <button onClick={()=>setCheckoutSuccess(null)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">Selesai</button>
      </div>
    </div>
  );

  // ── LAYOUT ─────────────────────────────────────────────────────────────────
  const tabs = [
    {id:'dashboard', icon:<LayoutDashboard size={17}/>, label:'Dashboard'},
    {id:'kasir', icon:<ShoppingCart size={17}/>, label:'Kasir', badge: cart.length||undefined},
    {id:'transaksi', icon:<History size={17}/>, label:'Transaksi', badge: undefined},
    {id:'products', icon:<Package size={17}/>, label:'Produk', badge: lowStockProducts.length||undefined},
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-300">
      <Toaster position="top-center" richColors/>
      {renderDeleteModal()}
      {renderSuccessModal()}

      <aside className="w-full md:w-60 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25"><ShoppingCart size={18}/></div>
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">NexPOS</h1>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {tabs.map(({id,icon,label,badge})=>(
            <button key={id} onClick={()=>setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab===id?'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400':'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {icon}{label}
              {badge ? <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"><Users size={14} className="text-gray-500 dark:text-gray-400"/></div>
            <div className="text-sm flex-1"><p className="font-semibold text-gray-800 dark:text-white text-xs">Admin User</p><p className="text-xs text-gray-400 dark:text-gray-500">Store Manager</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {{dashboard:'📊 Overview',kasir:'🛒 Kasir',transaksi:'📋 Riwayat Transaksi',products:'📦 Produk'}[activeTab]}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            <button onClick={()=>setDarkMode(d=>!d)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600">
              {darkMode?<Sun size={17}/>:<Moon size={17}/>}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10"/>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10"/>
          {activeTab==='dashboard'&&renderDashboard()}
          {activeTab==='kasir'&&renderKasir()}
          {activeTab==='transaksi'&&renderTransaksi()}
          {activeTab==='products'&&renderProducts()}
        </div>
      </main>
    </div>
  );
}
