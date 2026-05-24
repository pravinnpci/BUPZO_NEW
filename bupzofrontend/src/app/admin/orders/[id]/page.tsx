"use client";

import React, { useState } from "react";
import axios from "axios";

// Order Components
const OrderHeader = ({ order }: { order: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Order #{order.id}</h2>
          <p className="text-sm text-slate-500">Placed on {order.date}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`text-xs px-2 py-1 rounded-full ${
            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            {order.status}
          </span>
          {order.tracking && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              📦 {order.tracking}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ item, index }: { item: any; index: number }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
          <div>
            <div className="font-medium text-slate-800">{item.name}</div>
            <div className="text-xs text-slate-500">{item.sku}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">{item.color}</span>
          <span className="text-sm text-slate-600">{item.size}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="font-medium text-slate-800">₹{item.price.toFixed(2)}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="font-medium text-slate-800">{item.quantity}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="font-medium text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</div>
      </td>
    </tr>
  );
};

const OrderSummary = ({ order }: { order: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Order Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Subtotal</span>
          <span className="font-medium text-slate-800">₹{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tax</span>
          <span className="font-medium text-slate-800">₹{order.tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Shipping</span>
          <span className="font-medium text-slate-800">₹{order.shipping.toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Grand Total</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusDropdown = ({ status, onChange }: { status: string; onChange: (value: string) => void }) => {
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">📦 Order Status</h3>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const FulfillmentDropdown = ({ fulfillment, onChange }: { fulfillment: string; onChange: (value: string) => void }) => {
  const fulfillmentOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Packing', label: 'Packing' },
    { value: 'Ready to Ship', label: 'Ready to Ship' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">📦 Fulfillment Status</h3>
      <select
        value={fulfillment}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {fulfillmentOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const PackingGuidelines = ({ guidelines }: { guidelines: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">📦 AI Packing Guidelines</h3>
      <div className="space-y-2">
        <p className="text-sm text-slate-700">{guidelines}</p>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-slate-500">Priority:</span>
          <span className="text-sm font-medium text-indigo-600">Standard</span>
        </div>
      </div>
    </div>
  );
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState("Processing");
  const [fulfillment, setFulfillment] = useState("Not Started");
  const [isGenerating, setIsGenerating] = useState(false);
  const [packingGuidelines, setPackingGuidelines] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Mock order data
  const order = {
    id: params.id,
    date: "2026-05-22",
    status: "Processing",
    tracking: "TRK12345",
    subtotal: 129.99,
    tax: 10.40,
    shipping: 15.00,
    total: 155.39,
    customer: {
      name: "Asha R.",
      email: "asha@bupzo.com"
    },
    items: [
      {
        id: "P001",
        name: "Wireless Headphones",
        sku: "WH-1001",
        image: "/images/headphones.jpg",
        color: "Black",
        size: "One Size",
        price: 79.99,
        quantity: 1
      },
      {
        id: "P002",
        name: "Bluetooth Speaker",
        sku: "BS-2001",
        image: "/images/speaker.jpg",
        color: "White",
        size: "One Size",
        price: 49.99,
        quantity: 1
      }
    ]
  };

async function generatePackingGuidelines() {
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/agents/seller', {
        context: `Order ID: ${order.id}, Items: ${order.items.map(i => `${i.name} (${i.quantity}x), ${i.color}, ${i.size}`).join("; ")}`,
        task: 'packing_guidelines',
        format: 'text-only'
      });

      const result = response.data.result;
      setPackingGuidelines(result);
      setShowGuidelines(true);
    } catch (err: any) {
      alert('Mistral AI Error: ' + (err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Phoenix Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="text-sm text-slate-600">Order #{order.id} for {order.customer.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">Order ID: {order.id}</span>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <OrderHeader order={order} />

          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">📦 Ordered Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <OrderItem key={index} item={item} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <OrderSummary order={order} />
        </div>

        {/* Right Column - Status & Fulfillment */}
        <div className="lg:col-span-1 space-y-6">
          <StatusDropdown
            status={status}
            onChange={setStatus}
          />

          <FulfillmentDropdown
            fulfillment={fulfillment}
            onChange={setFulfillment}
          />

          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">🤖 AI Packing Helper</h3>
            <button
              onClick={generatePackingGuidelines}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center space-x-2 justify-center"
            >
              <span>🤖</span>
              <span>{isGenerating ? 'Generating...' : 'Generate Packing Guidelines'}</span>
            </button>
          </div>

          {showGuidelines && <PackingGuidelines guidelines={packingGuidelines} />}
        </div>
      </section>
    </div>
  );
}