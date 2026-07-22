import React from 'react';

export default function DontHaveGstPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
      <div className="max-w-4xl w-full px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Don't Have GST?</h1>
        <div className="bg-white p-8 rounded shadow text-gray-700">
          <p className="mb-4">No problem! You can still start your online business with BUPZO by registering with an Enrolment ID or UIN.</p>
          <div className="mt-8 space-y-4">
            <h2 className="font-bold text-lg text-brand-blue">Steps to follow:</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Register for a free Enrolment ID on the GST Portal.</li>
              <li>Provide your PAN and Aadhar details.</li>
              <li>Use the generated ID to sign up as a seller on BUPZO.</li>
            </ol>
            <p className="text-xs text-gray-500 mt-4 italic">Note: Selling without GST is restricted to intra-state sales for certain categories as per government regulations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
