import React, { useState, useEffect } from 'react';
import { Filter, Search, X, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      // Demo products for when Supabase is not configured
      const demoProducts = [
        {
          id: '1',
          name: 'Fortnite Account - Level 100',
          description: 'Premium Fortnite nalog sa Level 100, mnogo skinova i V-Bucks. Idealan za sve ljubitelje Battle Royale igara.',
          price: 2500,
          category: 'accounts',
          image_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
          created_at: new Date().toISOString(),
          stock_quantity: 15,
          track_stock: true,
          low_stock_threshold: 5,
          original_price: 3500,
          show_fake_discount: true
        },
        {
          id: '2',
          name: 'Netflix Premium - 1 Godina',
          description: 'Netflix Premium pretplata na 1 godinu. 4K kvalitet, 4 simultana stream-a, bez reklama.',
          price: 1200,
          category: 'subscriptions',
          image_url: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg',
          created_at: new Date().toISOString(),
          stock_quantity: 25,
          track_stock: true,
          low_stock_threshold: 5
        },
        {
          id: '3',
          name: 'Minecraft Java Edition',
          description: 'Originalna Minecraft Java Edition licenca. Pristup svim modovima i serverima.',
          price: 800,
          category: 'accounts',
          image_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
          created_at: new Date().toISOString(),
          stock_quantity: 50,
          track_stock: true,
          low_stock_threshold: 10
        },
        {
          id: '4',
          name: 'Discord Nitro - 6 Meseci',
          description: 'Discord Nitro pretplata na 6 meseci. Booster badge, custom emoji, HD video pozivi.',
          price: 600,
          category: 'addons',
          image_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg',
          created_at: new Date().toISOString(),
          stock_quantity: 30,
          track_stock: true,
          low_stock_threshold: 5
        }
      ];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.log('Using demo products');
        setProducts(demoProducts);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to demo products
      setProducts([
        {
          id: '1',
          name: 'Fortnite Account - Level 100',
          description: 'Premium Fortnite nalog sa Level 100, mnogo skinova i V-Bucks.',
          price: 2500,
          category: 'accounts',
          image_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
          created_at: new Date().toISOString(),
          stock_quantity: 15,
          track_stock: true,
          low_stock_threshold: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    { id: 'all', name: 'Svi Proizvodi' },
    { id: 'accounts', name: 'Gaming Nalozi' },
    { id: 'subscriptions', name: 'Pretplate' },
    { id: 'addons', name: 'Dodaci' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje proizvoda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Dobrodošli u GmShop</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Vaša premium destinacija za gaming naloge, pretplate i ekskluzivne dodatke. 
            Garantovan kvalitet, trenutna dostava.
          </p>
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pretražite proizvode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filtriraj po kategoriji:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nema pronađenih proizvoda</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Pokušajte da prilagodite termine pretrage' : 'Proverite ponovo kasnije za nove proizvode'}
            </p>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedProduct.category === 'accounts' ? 'bg-blue-100 text-blue-800' :
                    selectedProduct.category === 'subscriptions' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedProduct.category === 'accounts' ? 'Gaming Nalozi' :
                     selectedProduct.category === 'subscriptions' ? 'Pretplate' : 'Dodaci'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {selectedProduct.price.toFixed(0)} RSD
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Opis proizvoda</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Zatvori
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Dodaj u Korpu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;