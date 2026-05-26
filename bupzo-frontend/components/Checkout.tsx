'use client';

import { useState } from 'react';
import { useUser } from '@/lib/authStore';
import { getCartItems } from '@/lib/api';

export default function Checkout() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const calculateTotal = (cartItems: { product_price: number; quantity: number }[]) => {
    return cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0).toFixed(2);
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = useUser();
    if (!user?.id) {
      alert('Please log in to place an order.');
      return;
    }

    const cartItems = await getCartItems(user.id);
    const totalAmount = calculateTotal(cartItems);

    const orderData = {
      user_id: user.id,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      shipping_address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      phone: formData.phone,
      total_amount: totalAmount,
    };

    try {
      const response = await fetch('http://localhost:8003/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Order placed successfully! Thank you for your purchase.');
        console.log('Order result:', result);
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order.');
    }
  };

  return (
    <div className="bg-almond-silk p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="font-heading text-charcoal text-2xl mb-6">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-dim-grey mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-dim-grey mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-dim-grey mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-dim-grey mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-dim-grey mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-dim-grey mb-1">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-dim-grey mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-charcoal text-white py-2 px-6 rounded-lg hover:bg-dusty-mauve transition"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}