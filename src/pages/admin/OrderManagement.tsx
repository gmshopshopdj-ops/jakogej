import React, { useState, useEffect } from 'react';
import { Trash2, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order =>
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje Porudžbinama</h2>
        <div className="text-sm text-gray-600">
          Prikazano: {filteredOrders.length} od {orders.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pretražite po kodu porudžbine ili email adresi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Sve Porudžbine</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_code}</p>
                    <p className="text-sm text-gray-600">{order.customer_email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {order.total_amount.toFixed(0)} RSD
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && searchQuery && (
              <div className="p-8 text-center text-gray-500">
                Nema porudžbina koje odgovaraju pretrazi "{searchQuery}"
              </div>
            )}
            {orders.length === 0 && !searchQuery && (
              <div className="p-8 text-center text-gray-500">
                Nema pronađenih porudžbina
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg">
          {selectedOrder ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Detalji Porudžbine</h3>
                  <p className="text-sm text-gray-600">#{selectedOrder.order_code}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="text-green-600 hover:text-green-800"
                    title="Označi kao završeno"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="text-red-600 hover:text-red-800"
                    title="Označi kao otkazano"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Obriši porudžbinu"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Kupca:</label>
                  <p className="text-gray-900">{selectedOrder.customer_email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Ukupan Iznos:</label>
                  <p className="text-xl font-bold text-gray-900">{selectedOrder.total_amount.toFixed(0)} RSD</p>
                  {selectedOrder.discount_code && (
                    <p className="text-sm text-green-600 mt-1">
                      Popust primenjen: {selectedOrder.discount_code} (-{selectedOrder.discount_amount.toFixed(0)} RSD)
                    </p>
                  )}
                  {selectedOrder.referral_code && (
                    <p className="text-sm text-purple-600 mt-1">
                      Referral kod: {selectedOrder.referral_code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Datum Porudžbine:</label>
                  <p className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Poručene Stavke:</label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.product.price.toFixed(0)} RSD x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {(item.product.price * item.quantity).toFixed(0)} RSD
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">Instrukcije za Kupca:</p>
                  <p className="text-blue-700 mt-1">
                    Kupac treba da pošalje poruku na <strong>@koh0o</strong> na Telegramu sa kodom porudžbine <strong>{selectedOrder.order_code}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Izaberite porudžbinu da vidite detalje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;