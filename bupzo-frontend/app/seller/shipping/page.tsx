import React from 'react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Shipping & Delivery</h1>
        <div className="bg-white p-8 rounded shadow text-gray-700">
          <p className="mb-4">BUPZO integrates with top logistics providers to ensure your products reach customers safely and quickly.</p>
          <div className="mt-8 space-y-4">
            <div className="p-4 border border-gray-200 rounded">
              <h2 className="font-bold text-lg text-brand-blue">Integrated Logistics</h2>
              <p className="text-sm mt-1">We automatically assign the best courier partner based on the customer's pincode. No manual tie-ups required.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded">
              <h2 className="font-bold text-lg text-brand-blue">Flat Rate Shipping</h2>
              <p className="text-sm mt-1">Enjoy flat rate shipping across India with no hidden weight charges up to 5kg.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
