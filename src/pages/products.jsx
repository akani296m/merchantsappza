import React, { useState, useRef } from 'react';
import { useProducts } from '../context/productcontext';
import { useNavigate } from 'react-router-dom'; 
import { Share2, Eye, Save, Plus, X, ChevronDown } from 'lucide-react'

export default function ProductCreator() {
  const navigate = useNavigate();
  const [productTitle, setProductTitle] = useState('');
const [priceInput, setPriceInput] = useState(''); // UI string
const [price, setPrice] = useState(0);            // number (logic)
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [inventory, setInventory] = useState('');
  const [tags, setTags] = useState({ shoes: false, accessories: false, clothing: false });
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const { addProduct } = useProducts();
  const fileInputRef = useRef(null);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys'];

const formatPrice = (value) => {
  let clean = value.replace(/[^\d.]/g, '');

  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }

  const [integer, decimal] = clean.split('.');
  const formattedInt = integer
    ? parseInt(integer, 10).toLocaleString('en-ZA')
    : '';

  return decimal !== undefined
    ? `${formattedInt}.${decimal.slice(0, 2)}`
    : formattedInt;
};

const handlePriceChange = (e) => {
  const input = e.target.value;
  const formatted = formatPrice(input);

  const numeric = parseFloat(formatted.replace(/,/g, '')) || 0;

  setPriceInput(formatted);
  setPrice(numeric);
};


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // --- FIXED: Combined your Save logic into one function ---
  const handleSave = () => {
    setSaveStatus('Saving...');

const newProduct = {
  title: productTitle,
  price, // 👈 NUMBER (1299.99)
  description,
  category,
  inventory,
  images,
  tags,
  createdAt: new Date().toISOString()
};

    // Add to context
    addProduct(newProduct);

    // UI Feedback & Navigation
    setTimeout(() => {
      setSaveStatus('Saved!');
      setTimeout(() => navigate('/products'), 1000); 
    }, 1000);
  };
  // ---------------------------------------------------------

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle || 'Product',
          text: description,
          url: url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handlePreview = () => {
    const productData = {
      title: productTitle || 'Untitled Product',
      price: parseFloat(price.replace(/[^\d]/g, '')) || 0, 
      rating: 5, 
      description: description,
      images: images.length > 0 ? images.map(img => img.url) : ['No Image'], 
      tabs: [
        { id: '1', title: 'Description', content: description || 'No description.' },
        { id: '2', title: 'Product Details', content: `Category: ${category}\nInventory: ${inventory}` },
        { id: '3', title: 'Shipping', content: 'Standard shipping rates apply.' },
      ]
    };
    
    navigate('/store/product-preview', { state: { product: productData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Product Creator Page Wireframe (MVP)
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                {saveStatus || 'Save'}
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
        <input
             type="text"
             value={productTitle}
             onChange={(e) => setProductTitle(e.target.value)}
             maxLength={100}
             placeholder="Enter product title"
             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
             required
           />

          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-600 font-medium">R</span>
<input
  type="text"
  value={priceInput}
  onChange={handlePriceChange}
/>

            </div>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe your product..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="grid grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus size={32} className="text-gray-400" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Footer Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Inventory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inventory
              </label>
              <input
                type="number"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Product Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Tags
              </label>
              <div className="space-y-2">
                {Object.entries(tags).map(([key, checked]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setTags(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 uppercase">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{productTitle || 'Untitled Product'}</h3>
              <p className="text-2xl font-bold text-blue-600">R {price || '0'}</p>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map(img => (
                    <img key={img.id} src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <p className="text-gray-700 whitespace-pre-wrap">{description || 'No description provided.'}</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <div><strong>Category:</strong> {category || 'None'}</div>
                <div><strong>Stock:</strong> {inventory || '0'}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(tags).filter(([_, checked]) => checked).map(([tag]) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}