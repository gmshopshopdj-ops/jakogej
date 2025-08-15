import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedDiscountInfo, setAppliedDiscountInfo] = useState<{code: string, percentage: number, type: string, amount: number} | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const generateOrderCode = () => {
    return 'GM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const applyDiscountCode = async () => {
    if (!discountCode) return;

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        alert('Invalid or expired discount code');
        return;
      }

      // Check if discount code has reached maximum usage
      if (data.max_usage && data.usage_count >= data.max_usage) {
        alert('Ovaj kod za popust je dostigao maksimalan broj korišćenja');
        return;
      }

      if (data.discount_type === 'percentage') {
        setDiscount(data.discount_percentage);
        setAppliedDiscountInfo({
          code: data.code,
          percentage: data.discount_percentage,
          type: 'percentage',
          amount: 0
        });
        alert(`Popust primenjen! ${data.discount_percentage}% popusta`);
      } else {
        const fixedAmount = parseFloat(data.fixed_amount);
        setDiscount(0);
        setAppliedDiscountInfo({
          code: data.code,
          percentage: 0,
          type: 'fixed',
          amount: fixedAmount
        });
        alert(`Popust primenjen! ${fixedAmount} RSD popusta`);
      }
    } catch (error) {
      alert('Error applying discount code');
    }
  };

  const handleCheckout = async () => {
    if (!email || items.length === 0) return;

    setLoading(true);
    const code = generateOrderCode();
    const subtotal = getTotalPrice();
    const discountAmount = appliedDiscountInfo?.type === 'percentage' 
      ? subtotal * (discount / 100)
      : appliedDiscountInfo?.amount || 0;
    const total = subtotal - discountAmount;

    try {
      // Demo mode - just show success without database
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co') {
        console.log('Demo mode - order created locally');
        setOrderCode(code);
        setOrderComplete(true);
        clearCart();
        setDiscount(0);
        setAppliedDiscountInfo(null);
        setDiscountCode('');
        setReferralCode('');
        setLoading(false);
        return;
      }

      // Create the order first
      const { error } = await supabase
        .from('orders')
        .insert({
          order_code: code,
          items: items,
          total_amount: total,
          customer_email: email,
          discount_code: appliedDiscountInfo?.code || null,
          discount_amount: discountAmount,
          referral_code: referralCode || null,
          status: 'pending'
        });

      if (error) throw error;

      // Handle referral tracking
      if (referralCode) {
        try {
          // Find referral user by code
          const { data: referralUser, error: referralError } = await supabase
            .from('referral_users')
            .select('*')
            .eq('referral_code', referralCode)
            .eq('is_active', true)
            .single();

          if (!referralError && referralUser) {
            // Get the order ID we just created
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .select('id')
              .eq('order_code', code)
              .single();

            if (!orderError && orderData) {
              // Create referral order entry
              const { error: referralOrderError } = await supabase
                .from('referral_orders')
                .insert({
                  referral_user_id: referralUser.id,
                  order_id: orderData.id,
                  credit_earned: referralUser.credit_per_order,
                  status: 'pending'
                });
              
              if (referralOrderError) {
                console.error('Error creating referral order:', referralOrderError);
              }
            }
          }
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
          // Don't fail the order if referral processing fails
        }
      }

      // CRITICAL: Update discount usage count AFTER successful order creation
      if (appliedDiscountInfo) {
        const { data: currentDiscount, error: fetchError } = await supabase
          .from('discount_codes')
          .select('usage_count')
          .eq('code', appliedDiscountInfo.code);

        if (!fetchError && currentDiscount && currentDiscount[0]) {
          const { error: updateError } = await supabase
            .from('discount_codes')
            .update({ 
              usage_count: currentDiscount[0].usage_count + 1
            })
            .eq('code', appliedDiscountInfo.code);

          if (updateError) {
            console.error('Error updating discount usage:', updateError);
          }
        }
      }

      setOrderCode(code);
      setOrderComplete(true);
      clearCart();
      setDiscount(0);
      setAppliedDiscountInfo(null);
      setDiscountCode('');
      setReferralCode('');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Porudžbina Potvrđena!</h2>
            <p className="text-gray-600 mb-6">
              Vaša porudžbina je uspešno kreirana. Molimo kontaktirajte nas na Telegramu sa vašim kodom porudžbine.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Vaš Kod Porudžbine:</p>
              <p className="text-2xl font-bold text-blue-600 font-mono">{orderCode}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">Sledeći Koraci:</p>
              <p className="text-blue-700 mt-2">
                Pošaljite vaš kod porudžbine <strong>{orderCode}</strong> na naš Telegram: <strong>@koh0o</strong>
              </p>
              {referralCode && <p className="text-blue-700 mt-1">Referral kod: <strong>{referralCode}</strong></p>}
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Nastavi Kupovinu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaša korpa je prazna</h2>
            <p className="text-gray-600 mb-6">Dodajte proizvode u korpu da biste počeli.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Pregledaj Proizvode
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const discountAmount = appliedDiscountInfo?.type === 'percentage' 
    ? subtotal * (discount / 100)
    : appliedDiscountInfo?.amount || 0;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Korpa za Kupovinu</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Stavke u Korpi</h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {item.product.show_fake_discount && item.product.original_price && item.product.original_price > item.product.price ? (
                            <div className="flex items-center space-x-2">
                              <span className="line-through text-gray-500 dark:text-gray-400">{item.product.original_price.toFixed(0)} RSD</span>
                              <span className="text-red-600 dark:text-red-400 font-medium">{item.product.price.toFixed(0)} RSD</span>
                              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 py-0.5 rounded text-xs font-medium">
                                -{Math.round(((item.product.original_price - item.product.price) / item.product.original_price) * 100)}%
                              </span>
                            </div>
                          ) : (
                            <span>{item.product.price.toFixed(0)} RSD each</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.product.track_stock && item.quantity >= item.product.stock_quantity}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{(item.product.price * item.quantity).toFixed(0)} RSD</p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Checkout */}
          <div className="space-y-6">
            {/* Discount Code */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Kod za Popust</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Unesite kod"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={applyDiscountCode}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Primeni
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">✓ {discount}% popust primenjen</p>
              )}
            </div>

            {/* Referral Code */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Referral Kod</h3>
              <input
                type="text"
                placeholder="Unesite referral kod (opciono)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ako imate referral kod, unesite ga ovde
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pregled Porudžbine</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Međuzbir</span>
                  <span className="font-medium text-gray-900 dark:text-white">{subtotal.toFixed(0)} RSD</span>
                </div>
                {appliedDiscountInfo && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Popust ({appliedDiscountInfo.code})</span>
                    <span>-{discountAmount.toFixed(0)} RSD</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Ukupno</span>
                  <span>{total.toFixed(0)} RSD</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Adresa
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="vas@email.com"
                  required
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={!email || loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Završi Porudžbinu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;