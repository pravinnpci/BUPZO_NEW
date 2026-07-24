import React, { useState } from 'react';

interface Seller {
  id: string;
  user_id?: string;
  businessName: string;
  commission: number;
  status: string;
  date: string;
  owner?: string;
  owner_email?: string;
  owner_phone?: string;
  followers?: number;
  followers_count?: number;
  kyc_details?: any;
}

interface AdminSellersProps {
  sellers: Seller[];
  onDeleteSeller: (sellerId: string) => void;
  onUpdateSeller: (sellerId: string, businessName: string, commission: number, status: string, kycDetails?: any) => Promise<void>;
  onCreateSeller: (data: any) => Promise<boolean | void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      const resp = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        setAddAadharUrl(data.url);
      } else {
        alert("File upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Edit Seller Modal States
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPan, setEditPan] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNum, setEditAccountNum] = useState('');
  const [editIfsc, setEditIfsc] = useState('');

  // KYC Viewer State
  const [viewKycSeller, setViewKycSeller] = useState<Seller | null>(null);
  const [messageSeller, setMessageSeller] = useState<Seller | null>(null);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [isSending, setIsSending] = useState(false);

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
    
    const kyc = selectedSeller.kyc_details || {};
    const updatedKyc = {
      ...kyc,
      pan: editPan,
      gstin: editGstin,
      bankName: editBankName,
      accountNum: editAccountNum,
      ifsc: editIfsc,
    };
    
    await onUpdateSeller(selectedSeller.id, editName, parseFloat(editCommission), editStatus, updatedKyc);
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

    if (sortKey === 'commission' || (sortKey as string) === 'followers') {
      aVal = Number((sortKey as string) === 'followers' ? (a.followers_count !== undefined ? a.followers_count : a.followers || 0) : aVal) || 0;
      bVal = Number((sortKey as string) === 'followers' ? (b.followers_count !== undefined ? b.followers_count : b.followers || 0) : bVal) || 0;
    } else {
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
    }

    if (aVal === bVal) return 0;
    const isLess = aVal < bVal;
    if (isLess) return sortOrder === 'asc' ? -1 : 1;
    return sortOrder === 'asc' ? 1 : -1;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedSellers.length / itemsPerPage);
  const paginatedSellers = sortedSellers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderSortIndicator = (k: keyof Seller) => {
    if (sortKey !== k) return ' ';
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
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
              className="pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium w-64 outline-none focus:border-primary"
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
        <div className="mb-4 text-xs font-semibold text-zinc-500">
          Total Merchants: {sellers.length} | Showing: {paginatedSellers.length}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 select-none font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>Seller ID {renderSortIndicator('id')}</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('businessName')}>Store Name {renderSortIndicator('businessName')}</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('owner')}>Owner (User ID) {renderSortIndicator('owner')}</th>
                <th className="py-2.5">Contacts</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('followers' as any)}>Followers {renderSortIndicator('followers' as any)}</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('commission')}>Commission Rate {renderSortIndicator('commission')}</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>Status {renderSortIndicator('status')}</th>
                <th className="py-2.5 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('date')}>Date {renderSortIndicator('date')}</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSellers.map(s => (
                <tr key={s.id} className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 font-mono">{s.id ? `${s.id.substring(0, 8)}...` : ''}</td>
                  <td 
                    className="py-3 font-semibold text-[#3874ff] cursor-pointer hover:underline"
                    onClick={() => setViewKycSeller(s)}
                  >
                    {s.businessName}
                  </td>
                  <td className="py-3 font-mono text-zinc-500">{s.owner || s.user_id ? `${(s.owner || s.user_id || '').substring(0, 8)}...` : 'N/A'}</td>
                  <td className="py-3 font-mono text-zinc-500">
                    {s.owner_email && <div>{s.owner_email}</div>}
                    {s.owner_phone && <div>{s.owner_phone}</div>}
                  </td>
                  <td className="py-3 font-mono font-bold text-blue-600">👥 {s.followers_count !== undefined ? s.followers_count : (s.followers || 0)}</td>
                  <td className="py-3 font-mono font-bold">{s.commission}%</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${s.status === 'Approved' ? 'bg-green-100 text-green-700' : s.status === 'Pending KYC' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">{s.date}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {(!s.kyc_details || ( (!s.kyc_details.documents || s.kyc_details.documents.length === 0) && !Object.keys(s.kyc_details).some(k => k.toLowerCase().includes('url') || k.toLowerCase() === 'pan' || k.toLowerCase() === 'ifsc') )) && (
                        <span className="text-red-500 font-bold text-[10px] flex items-center px-2 mr-2 border border-red-200 bg-red-50 rounded" title="Missing KYC Docs">Missing Docs</span>
                      )}
                      <button 
                        onClick={() => {
                          setMessageSeller(s);
                          setMsgSubject('Important message regarding your Merchant Account');
                          setMsgContent('');
                        }}
                        title="Message Seller"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-sm font-bold flex items-center justify-center h-[24px] w-[28px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSeller(s);
                          setEditName(s.businessName);
                          setEditCommission(s.commission.toString());
                          setEditStatus(s.status === 'Approved' ? 'APPROVED' : s.status === 'Pending KYC' ? 'PENDING' : 'REJECTED');
                          setEditPan(s.kyc_details?.pan || '');
                          setEditGstin(s.kyc_details?.gstin || '');
                          setEditBankName(s.kyc_details?.bankName || '');
                          setEditAccountNum(s.kyc_details?.accountNum || '');
                          setEditIfsc(s.kyc_details?.ifsc || '');
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
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-xs font-semibold text-zinc-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
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
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={addAadharUrl}
                      onChange={(e) => setAddAadharUrl(e.target.value)}
                      placeholder="https://..." 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm"
                    />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*,.pdf" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold text-xs whitespace-nowrap transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Doc'}
                    </button>
                  </div>
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
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Business Name</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Commission Rate (%)</label>
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
              
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-sm mb-2 mt-2">KYC & Bank Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1">PAN Number</label>
                    <input type="text" value={editPan} onChange={(e) => setEditPan(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">GSTIN</label>
                    <input type="text" value={editGstin} onChange={(e) => setEditGstin(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none uppercase" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-zinc-500 mb-1">Bank Name</label>
                    <input type="text" value={editBankName} onChange={(e) => setEditBankName(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Account Number</label>
                    <input type="text" value={editAccountNum} onChange={(e) => setEditAccountNum(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">IFSC Code</label>
                    <input type="text" value={editIfsc} onChange={(e) => setEditIfsc(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-sm outline-none font-mono uppercase" />
                  </div>
                </div>
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
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold text-lg">KYC Verification Documents</h3>
              <button onClick={() => setViewKycSeller(null)} className="text-sm opacity-80 hover:opacity-100 flex items-center gap-1">✕ Close</button>
            </div>
            <div className="p-6 text-sm text-zinc-700 dark:text-zinc-300 space-y-4 overflow-y-auto">
              <div>
                <span className="font-bold text-zinc-400">Business Name:</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{viewKycSeller.businessName}</p>
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
                <span className="font-bold text-zinc-400">FSSAI License:</span>
                <p className="font-mono text-zinc-200 mt-1">{viewKycSeller.kyc_details?.fssai || 'Not Provided'}</p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">Bank Account Details:</span>
                <p className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-800 dark:text-zinc-200 font-mono mt-1 border border-zinc-200 dark:border-zinc-700">
                  Bank: {viewKycSeller.kyc_details?.bankName || 'N/A'}<br/>
                  A/C: {viewKycSeller.kyc_details?.accountNumber || 'N/A'}<br/>
                  IFSC: {viewKycSeller.kyc_details?.ifsc || 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-bold text-zinc-400">Uploaded Document Attachments:</span>
                {viewKycSeller.kyc_details?.documents?.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {viewKycSeller.kyc_details.documents.map((doc: string, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                        {doc.endsWith('.pdf') ? (
                          <a href={doc} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View Document {idx + 1}</a>
                        ) : (
                          <img 
                            src={doc} 
                            alt={`Verification Doc ${idx + 1}`} 
                            className="max-h-64 object-contain rounded mx-auto"
                          />
                        )}
                      </div>
                    ))}
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
