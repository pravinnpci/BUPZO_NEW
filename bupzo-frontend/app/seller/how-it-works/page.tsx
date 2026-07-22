import React from 'react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">How it Works</h1>
        <div className="bg-white p-8 rounded shadow text-gray-700">
          <ol className="list-decimal pl-5 space-y-6 font-bold text-gray-800">
            <li>
              <span className="text-brand-blue">Register Your Account</span>
              <p className="font-normal text-sm mt-1 text-gray-600">Provide your GST, Bank Details, and Business Info to get verified within 24 hours.</p>
            </li>
            <li>
              <span className="text-brand-blue">List Your Products</span>
              <p className="font-normal text-sm mt-1 text-gray-600">Upload your product catalogs easily. Our AI helps generate descriptions and tags.</p>
            </li>
            <li>
              <span className="text-brand-blue">Receive Orders & Ship</span>
              <p className="font-normal text-sm mt-1 text-gray-600">When an order is placed, pack it. We will handle the logistics pickup.</p>
            </li>
            <li>
              <span className="text-brand-blue">Get Paid</span>
              <p className="font-normal text-sm mt-1 text-gray-600">Payments are securely deposited into your bank account through our escrow system.</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
