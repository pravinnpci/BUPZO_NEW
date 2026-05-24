"use client";

import React, { useState } from "react";
import axios from "axios";

// Customer Profile Components
const CustomerAvatar = ({ name, email, verified }: { name: string; email: string; verified: boolean }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-3xl text-indigo-600">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{name}</h3>
          <p className="text-sm text-slate-500">{email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerInfoCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-100 p-2 rounded-lg">
          {icon}
        </div>
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-lg font-medium text-slate-800">{value}</div>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ order }: { order: any }) => {
  return (
    <div className="border-b border-slate-100 py-3">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          <span className="text-slate-500">📦</span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-slate-800">Order #{order.id}</div>
          <div className="text-sm text-slate-500">{order.date}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-slate-800">₹{order.total.toFixed(2)}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            {order.status}
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistItem = ({ item }: { item: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-3">
      <div className="flex items-center space-x-3">
        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
        <div className="flex-1">
          <div className="font-medium text-sm text-slate-800">{item.name}</div>
          <div className="text-xs text-slate-500">{item.category}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-indigo-600">₹{item.price.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

const ReviewItem = ({ review }: { review: any }) => {
  return (
    <div className="border-b border-slate-100 py-3">
      <div className="flex items-center space-x-3">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}>{star <= review.rating ? '⭐' : '☆'}</span>
          ))}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-slate-800">{review.product}</div>
          <div className="text-xs text-slate-500">{review.date}</div>
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
    </div>
  );
};

const NotesSection = ({ notes, setNotes, isGenerating, onGenerate }: { notes: string; setNotes: (value: string) => void; isGenerating: boolean; onGenerate: () => void }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">📝 Customer Notes</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        rows={4}
        placeholder="Add notes about this customer..."
      />
      <div className="flex space-x-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center space-x-2"
        >
          <span>🤖</span>
          <span>{isGenerating ? 'Generating...' : 'AI Sentiment Summary'}</span>
        </button>
      </div>
    </div>
  );
};

const SentimentSummary = ({ summary }: { summary: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">📊 AI Sentiment Summary</h3>
      <div className="space-y-2">
        <p className="text-sm text-slate-700">{summary}</p>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-slate-500">Suggested Action:</span>
          <span className="text-sm font-medium text-indigo-600">Offer exclusive loyalty points</span>
        </div>
      </div>
    </div>
  );
};

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentimentSummary, setSentimentSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  // Mock customer data
  const customer = {
    id: params.id,
    name: "Asha R.",
    email: "asha@bupzo.com",
    verified: true,
    memberSince: "January 2025",
    loyaltyTier: "Gold",
    totalOrders: 12,
    totalSpent: 1842.50,
    wishlistCount: 4,
    reviewCount: 3
  };

  // Mock orders
  const orders = [
    { id: "ORD1001", date: "2026-05-10", total: 129.99, status: "Delivered" },
    { id: "ORD1002", date: "2026-05-18", total: 49.50, status: "Shipped" },
    { id: "ORD1003", date: "2026-05-22", total: 249.99, status: "Processing" },
    { id: "ORD1004", date: "2026-05-15", total: 79.99, status: "Delivered" },
  ];

  // Mock wishlist
  const wishlist = [
    { id: "WL001", name: "Premium Headphones", price: 199.99, image: "/images/headphones.jpg", category: "Electronics" },
    { id: "WL002", name: "Designer Jacket", price: 149.99, image: "/images/jacket.jpg", category: "Fashion" },
    { id: "WL003", name: "Smart Watch", price: 249.99, image: "/images/watch.jpg", category: "Electronics" },
  ];

  // Mock reviews
  const reviews = [
    { id: "R001", product: "Wireless Headphones", rating: 5, comment: "Excellent sound quality and comfortable fit!", date: "2026-05-12" },
    { id: "R002", product: "Organic Coffee", rating: 4, comment: "Great taste, but wish it came in larger quantities.", date: "2026-05-20" },
    { id: "R003", product: "Bluetooth Speaker", rating: 5, comment: "Perfect for outdoor use. Waterproof and great battery life.", date: "2026-05-11" },
  ];

async function generateSentimentSummary() {
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/agents/admin', {
        context: `Customer ID: ${customer.id}, Notes: "${notes}", Reviews: ${reviews.map(r => `${r.product}: ${r.rating} stars - "${r.comment}"`).join("; ")}`,
        task: 'customer_sentiment_analysis',
        format: 'text-only'
      });

      const result = response.data.result;
      setSentimentSummary(result);
      setShowSummary(true);
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
          <h1 className="text-3xl font-bold text-slate-900">Customer Details</h1>
          <p className="text-sm text-slate-600">Profile for {customer.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">Customer ID: {customer.id}</span>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Profile */}
        <div className="lg:col-span-1 space-y-6">
          <CustomerAvatar
            name={customer.name}
            email={customer.email}
            verified={customer.verified}
          />

          <div className="grid grid-cols-2 gap-4">
            <CustomerInfoCard
              title="Member Since"
              value={customer.memberSince}
              icon={<span className="text-indigo-600">📅</span>}
            />
            <CustomerInfoCard
              title="Loyalty Tier"
              value={customer.loyaltyTier}
              icon={<span className="text-indigo-600">🏆</span>}
            />
            <CustomerInfoCard
              title="Total Orders"
              value={customer.totalOrders.toString()}
              icon={<span className="text-indigo-600">📦</span>}
            />
            <CustomerInfoCard
              title="Total Spent"
              value={`₹${customer.totalSpent.toFixed(2)}`}
              icon={<span className="text-indigo-600">💰</span>}
            />
          </div>

          <NotesSection
            notes={notes}
            setNotes={setNotes}
            isGenerating={isGenerating}
            onGenerate={generateSentimentSummary}
          />

          {showSummary && <SentimentSummary summary={sentimentSummary} />}
        </div>

        {/* Right Column - Orders, Wishlist, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">📋 Order History</h2>
              <span className="text-sm text-slate-500">{orders.length} orders</span>
            </div>
            <div className="space-y-3">
              {orders.map((order, index) => (
                <OrderItem key={index} order={order} />
              ))}
            </div>
          </div>

          {/* Wishlist */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">❤️ Wishlist</h2>
              <span className="text-sm text-slate-500">{wishlist.length} items</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {wishlist.map((item, index) => (
                <WishlistItem key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">⭐ Ratings & Reviews</h2>
              <span className="text-sm text-slate-500">{reviews.length} reviews</span>
            </div>
            <div className="space-y-3">
              {reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}