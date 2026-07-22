'use client';

import { useState } from 'react';
import { useUser } from '@/lib/authStore';

export default function SellerKYCModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useUser();
  const [businessName, setBusinessName] = useState(user?.name ? `${user.name}'s Store` : '');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert("Maximum 5 documents allowed.");
      return;
    }
    
    const uploadedUrls: string[] = [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:8004';
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const resp = await fetch(`${apiUrl}/api/upload/`, {
          method: 'POST',
          body: formData
        });
        if (resp.ok) {
          const data = await resp.json();
          uploadedUrls.push(data.url);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    setDocuments(prev => [...prev, ...uploadedUrls].slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      setError('Business Name is required.');
      return;
    }
    if (!gstin || gstin.length < 15) {
      setError('Valid GSTIN is required (15 characters).');
      return;
    }
    if (fssai && fssai.length < 14) {
      setError('Valid FSSAI is required (14 characters) if provided.');
      return;
    }
    if (!bankName || !accountNumber || !ifsc) {
      setError('All bank account details are required.');
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:8004';
      const payload = {
        phone: user.phone || `MOCK-${user.id.substring(0, 8)}`,
        email: user.email || undefined,
        business_name: businessName,
        kyc_details: { gstin, fssai, documents, status: 'submitted_by_customer', bankName: bankName, accountNumber: accountNumber, ifsc }
      };

      const response = await fetch(`${apiUrl}/api/sellers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to submit KYC.');
      
      alert('KYC Submitted Successfully! You are now a Seller.');
      // Upgrade local user state
      setUser({ ...user, isSeller: true });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition z-10 bg-white/50 dark:bg-zinc-800/50 rounded-full p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 pb-4 shrink-0 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Become a Seller</h2>
              <p className="text-sm text-gray-500">Complete KYC to unlock seller dashboard.</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-6 overflow-y-auto flex-1">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Name *</label>
              <input 
                type="text" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                placeholder="E.g. Fresh Foods Ltd."
                className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">GSTIN (Optional)</label>
              <input 
                type="text" 
                value={gstin} 
                onChange={(e) => setGstin(e.target.value)} 
                placeholder="22AAAAA0000A1Z5"
                className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">FSSAI License (If Food)</label>
              <input 
                type="text" 
                value={fssai} 
                onChange={(e) => setFssai(e.target.value)} 
                placeholder="10020000000000"
                className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Business Documents (Max 5)</label>
              <input 
                type="file" 
                multiple
                accept="image/*,.pdf"
                onChange={handleDocumentUpload}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#3874ff] file:text-white hover:file:bg-opacity-90"
              />
              {documents.length > 0 && (
                <div className="mt-2 text-xs text-green-600 font-bold">{documents.length} document(s) uploaded</div>
              )}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">Bank Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Bank Name *</label>
                  <input 
                    type="text" 
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#3874ff]"
                    placeholder="e.g. State Bank of India"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Account Number *</label>
                  <input 
                    type="text" 
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#3874ff]"
                    placeholder="Enter Account Number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">IFSC Code *</label>
                  <input 
                    type="text" 
                    value={ifsc}
                    onChange={e => setIfsc(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#3874ff]"
                    placeholder="e.g. SBIN0001234"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Submitting...' : 'Submit KYC & Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
