import React from 'react';
import { useProducts } from '../context/productcontext';
import { Package, Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const { products, deleteProduct, editProduct, loading } = useProducts();
  const navigate = useNavigate();

  // Helper to extract actual URL from nested objects or return string as-is
  const getImageUrl = (imageItem) => {
    if (!imageItem) return null;
    if (typeof imageItem === 'string') return imageItem;
    // Recursively extract URL from nested objects
    if (imageItem.url) return getImageUrl(imageItem.url);
    return null;
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleEdit = (product) => {
    navigate('/products/create', { state: { editProduct: product } });
  };

  const handleCreate = () => {
    navigate('/products/create');
  };

  // Toggle product active status
  const handleToggleStatus = async (product) => {
    const newIsActive = !product.is_active;
    await editProduct(product.id, { ...product, is_active: newIsActive });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-semibold text-[#1F1F1F]">Products</h1>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border text-gray-500">
            Total: {products.length}
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
          <p className="text-gray-500">Go to "Add Product" to create your first item.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Product</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Category</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Price</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Inventory</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <span
                      onClick={() => handleEdit(product)}
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                    >
                      {product.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-gray-600">
                    R {Number(product.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.inventory} in stock</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {product.is_active ? 'active' : 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mr-4 focus:outline-none ${product.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      title={`Make ${product.is_active ? 'Draft' : 'Active'}`}
                    >
                      <span
                        className={`${product.is_active ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-gray-400 hover:text-blue-600 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
}