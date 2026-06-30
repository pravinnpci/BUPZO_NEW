import React, { useState } from 'react';

interface Seller {
  id: string;
  user_id?: string;
  businessName: string;
  commission: number;
  status: string;
  date: string;
  owner?: string;
  kyc_details?: any;
}

interface AdminSellersProps {
  sellers: Seller[];
  onDeleteSeller: (sellerId: string) => void;
  onUpdateSeller: (sellerId: string, businessName: string, commission: number, status: string) => Promise<void>;
  onCreateSeller: (data: any) => Promise<void>;
}

export const AdminSellers: React.FC<AdminSellersProps> = ({
  sellers,
  onDeleteSeller,
  onUpdateSeller,
  onCreateSeller
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Seller | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add Merchant Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addBusinessName, setAddBusinessName] = useState('');
  const [addCommission, setAddCommission] = useState('10.0');
  const [addStatus, setAddStatus] = useState('APPROVED');
  
  // KYC details form states
  const [addGstin, setAddGstin] = useState('');
  const [addPan, setAddPan] = useState('');
  const [addBankName, setAddBankName] = useState('');
  const [addAccountNum, setAddAccountNum] = useState('');
  const [addIfsc, setAddIfsc] = useState('');
  const [addAadharUrl, setAddAadharUrl] = useState('');

  // Edit Seller Modal States
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // KYC Viewer State
  const [viewKycSeller, setViewKycSeller] = useState<Seller | null>(null);

  const handleSort = (key: keyof Seller) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPhone || !addBusinessName) {
      alert("Please enter both merchant phone and business name.");
      return;
    }
    const kyc_details = {
      gstin: addGstin || null,
      pan: addPan || null,
      bankName: addBankName || null,
      accountNumber: addAccountNum || null,
      ifsc: addIfsc || null,
      aadharUrl: addAadharUrl || null
    };
    await onCreateSeller({
      phone: addPhone,
      email: addEmail || null,
      business_name: addBusinessName,
      commission_rate: parseFloat(addCommission) || 10.0,
      status: addStatus,
      kyc_details
    });
    // Reset States
    setAddPhone('');
    setAddEmail('');
    setAddBusinessName('');
    setAddCommission('10.0');
    setAddStatus('APPROVED');
    setAddGstin('');
    setAddPan('');
    setAddBankName('');
    setAddAccountNum('');
    setAddIfsc('');
    setAddAadharUrl('');
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;
    await onUpdateSeller(selectedSeller.id, editName, parseFloat(editCommission), editStatus);
    setShowEditModal(false);
    setSelectedSeller(null);
  };

  const filteredSellers = sellers.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      (s.businessName || '').toLowerCase().includes(term) ||
      (s.status || '').toLowerCase().includes(term) ||
      (s.id || '').toLowerCase().includes(term) ||
      (s.owner || s.user_id || '').toLowerCase().includes(term)
    );
  });

  const sortedSellers = [...filteredSellers].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === 'commission') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIndicator = ({ k }: { k: keyof Seller }) => {
    if (sortKey !== k) return <span className="ml-1 text-zinc-400 text-[10px] select-none">⇅</span>;
    return sortOrder === 'asc' ? <span className="ml-1 text-primary text-[10px] select-none">▲</span> : <span className="ml-1 text-primary text-[10px] select-none">▼</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Merchant Management Console</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit active store seller accounts, commission rates, and KYC documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-primary"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-charcoal dark:bg-zinc-200 text-white dark:text-zinc-950 px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>🏪</span> Register Merchant
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-[#e8e1dd] dark:border-[#2f2b3b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 select-none font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>Seller ID <SortIndicator k="id" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('businessName')}>Store Name <SortIndicator k="businessName" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('owner')}>Owner (User ID) <SortIndicator k="owner" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('commission')}>Commission Rate <SortIndicator k="commission" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>Status <SortIndicator k="status" /></th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('date')}>Date <SortIndicator k="date" /></th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSellers.map(s => (
                <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 font-mono">{s.id ? `${s.id.substring(0, 8)}...` : ''}</td>
                  <td className="py-3 font-semibold text-[#3874ff]">{s.businessName}</td>
                  <td className="py-3 font-mono text-zinc-500">{s.owner || s.user_id ? `${(s.owner || s.user_id || '').substring(0, 8)}...` : 'N/A'}</td>
                  <td className="py-3 font-mono font-bold">{s.commission}%</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${s.status === 'Approved' ? 'bg-green-100 text-green-700' : s.status === 'Pending KYC' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">{s.date}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => {
                          setSelectedSeller(s);
                          setEditName(s.businessName);
                          setEditCommission(s.commission.toString());
                          setEditStatus(s.status === 'Approved' ? 'APPROVED' : s.status === 'Pending KYC' ? 'PENDING' : 'REJECTED');
                          setShowEditModal(true);
                        }}
                        className="bg-charcoal hover:bg-opacity-95 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setViewKycSeller(s)}
                        className="bg-blue-600 hover:bg-opacity-95 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        KYC Docs
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete seller store "${s.businessName}"?`)) {
                            onDeleteSeller(s.id);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-655 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedSellers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">No sellers registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER NEW MERCHANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-heading">Register New Merchant</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="e.g. +919876543211" 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. merchant@bupzo.com" 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Store / Business Name</label>
                <input 
                  type="text" 
                  value={addBusinessName}
                  onChange={(e) => setAddBusinessName(e.target.value)}
                  placeholder="e.g. Madurai Halwas Ltd" 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-zinc-500 mb-1">Commission (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={addCommission}
                    onChange={(e) => setAddCommission(e.target.value)}
                    placeholder="10.0" 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-zinc-500 mb-1">Status</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                    required
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Merchant KYC Details</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-500 mb-1">GSTIN Number</label>
                    <input 
                      type="text" 
                      value={addGstin}
                      onChange={(e) => setAddGstin(e.target.value)}
                      placeholder="e.g. 33AAAAA0000A1Z1" 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">PAN Number</label>
                    <input 
                      type="text" 
                      value={addPan}
                      onChange={(e) => setAddPan(e.target.value)}
                      placeholder="e.g. ABCDE1234F" 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">Bank Name</label>
                  <input 
                    type="text" 
                    value={addBankName}
                    onChange={(e) => setAddBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank" 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-zinc-500 mb-1">Account No</label>
                    <input 
                      type="text" 
                      value={addAccountNum}
                      onChange={(e) => setAddAccountNum(e.target.value)}
                      placeholder="501000..." 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-zinc-500 mb-1">IFSC Code</label>
                    <input 
                      type="text" 
                      value={addIfsc}
                      onChange={(e) => setAddIfsc(e.target.value)}
                      placeholder="HDFC000..." 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1">Aadhar Document Link (URL)</label>
                  <input 
                    type="text" 
                    value={addAadharUrl}
                    onChange={(e) => setAddAadharUrl(e.target.value)}
                    placeholder="https://..." 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SELLER MODAL */}
      {showEditModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-bold font-heading mb-4">Edit Merchant Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-zinc-500 mb-1">Store / Business Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Commission Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={editCommission} 
                  onChange={(e) => setEditCommission(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none"
                  required
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setSelectedSeller(null); }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-opacity-90 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC DETAILS VIEWER MODAL */}
      {viewKycSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-65 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] dark:bg-[#15131b] border border-[#e8e1dd] dark:border-[#2f2b3b] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-2 border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-heading">KYC Verification Documents</h3>
              <button 
                onClick={() => setViewKycSeller(null)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-zinc-400">Business Name:</span>
                <p className="text-sm font-semibold">{viewKycSeller.businessName}</p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">GST / Tax Number:</span>
                <p className="font-mono">{viewKycSeller.kyc_details?.gstin || 'Not Provided'}</p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">PAN Card Number:</span>
                <p className="font-mono">{viewKycSeller.kyc_details?.pan || 'Not Provided'}</p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">Bank Account Details:</span>
                <p className="font-mono bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 mt-1">
                  Bank: {viewKycSeller.kyc_details?.bankName || 'N/A'}<br/>
                  A/C: {viewKycSeller.kyc_details?.accountNumber || 'N/A'}<br/>
                  IFSC: {viewKycSeller.kyc_details?.ifsc || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">Uploaded Document Attachment:</span>
                {viewKycSeller.kyc_details?.aadharUrl ? (
                  <div className="mt-2 bg-white dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                    <img 
                      src={viewKycSeller.kyc_details.aadharUrl} 
                      alt="Verification Doc" 
                      className="max-h-64 object-contain rounded mx-auto"
                    />
                  </div>
                ) : (
                  <p className="text-zinc-500 italic mt-1">No scanned document file upload attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
