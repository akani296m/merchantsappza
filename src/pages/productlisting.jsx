import React from 'react';
import { useProducts } from '../context/productcontext';
import { Package, Edit, Trash2 } from 'lucide-react';

export default function Products() {
  const { products } = useProducts(); // Get the list from global storage
  const handleDelete = (id) => {
  if (confirm('Delete this product?')) {
    deleteProduct(id);
  }
};

const handleEdit = (product) => {
  navigate('/products/create', { state: { editProduct: product } });
};

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-semibold text-[#1F1F1F]">Products</h1>
        <div className="bg-white px-4 py-2 rounded-lg border text-gray-500">
           Total: {products.length}
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
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{product.title}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-gray-600">{product.price}</td>
                  <td className="px-6 py-4 text-gray-600">{product.inventory} in stock</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-blue-600 mr-3">
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
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