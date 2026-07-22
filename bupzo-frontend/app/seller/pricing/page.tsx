import React from 'react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Pricing & Commission</h1>
        <div className="bg-white p-8 rounded shadow text-gray-700">
          <p className="mb-4">At BUPZO, we believe in transparent pricing. We charge a flat commission rate depending on your category.</p>
          <ul className="list-disc pl-5 space-y-2 font-bold text-gray-800">
            <li>Fashion: 12%</li>
            <li>Electronics: 8%</li>
            <li>Home & Kitchen: 10%</li>
            <li>Groceries: 5%</li>
          </ul>
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-3">No hidden fees</h2>
            <p>You only pay when you make a sale. Our payment gateway and escrow services are included in the commission.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
