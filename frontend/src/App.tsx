import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Edit } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/products';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload);
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category || '');
    setEditingId(product.id);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setStock('');
    setCategory('');
    setEditingId(null);
  };

  const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" />
          <h1 className="text-xl font-bold">POS Dashboard</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stats & Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-gray-500 text-sm font-medium">Total Inventory Value</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">Rp {totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">{products.length} Items in stock</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <Plus size={18} /> {editingId ? 'Update' : 'Save'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Product List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No products found. Add some!</td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{product.name}</td>
                      <td className="p-4 text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">{product.category || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-gray-800">Rp {product.price.toLocaleString()}</td>
                      <td className="p-4 text-gray-800">{product.stock}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1 transition">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
