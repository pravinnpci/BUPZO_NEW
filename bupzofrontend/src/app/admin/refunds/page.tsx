"use client";

import React, { useState } from "react";
import axios from "axios";

// Refund Components
const RefundTransaction = ({ transaction }: { transaction: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-800">Order #{transaction.orderId}</div>
          <div className="text-sm text-slate-500">{transaction.date}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-slate-800">₹{transaction.amount.toFixed(2)}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            transaction.status === 'Approved' ? 'bg-green-100 text-green-800' :
            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            {transaction.status}
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm text-slate-600">
        {transaction.reason}
      </div>
    </div>
  );
};

const RefundSummary = ({ total }: { total: number }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Refund Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Total Refund Amount</span>
          <span className="font-medium text-slate-800">₹{total.toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Total to Process</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RefundForm = ({ amount, setAmount, isProcessing, onSubmit }: { amount: string; setAmount: (value: string) => void; isProcessing: boolean; onSubmit: () => void }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">💳 Refund Request</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Refund Amount</label>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-medium">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center space-x-2 justify-center"
        >
          <span>💳</span>
          <span>{isProcessing ? 'Processing...' : 'Request Refund'}</span>
        </button>
      </div>
    </div>
  );
};

const RiskIndicator = ({ riskLevel, riskMessage }: { riskLevel: string; riskMessage: string }) => {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="font-semibold text-slate-800 mb-3">🛡️ AI Fraud Risk Assessment</h3>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRiskColor()}`}>
          <span className="text-sm font-bold">{riskLevel}</span>
        </div>
        <div>
          <div className="font-medium text-slate-800">{riskLevel} Risk</div>
          <div className="text-sm text-slate-600">{riskMessage}</div>
        </div>
      </div>
    </div>
  );
};

export default function RefundManagementPage() {
  const [amount, setAmount] = useState("0.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [riskLevel, setRiskLevel] = useState("Medium");
  const [riskMessage, setRiskMessage] = useState("Medium risk detected. Review order history for suspicious activity.");

  // Mock refund transactions
  const transactions = [
    {
      orderId: "ORD1001",
      date: "2026-05-20",
      amount: 129.99,
      status: "Approved",
      reason: "Customer requested refund for damaged item"
    },
    {
      orderId: "ORD1002",
      date: "2026-05-18",
      amount: 49.50,
      status: "Pending",
      reason: "Customer not satisfied with product quality"
    },
    {
      orderId: "ORD1003",
      date: "2026-05-15",
      amount: 79.99,
      status: "Approved",
      reason: "Duplicate order by mistake"
    }
  ];

  // Calculate total refund amount
  const totalRefundAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

async function requestRefund() {
    setIsProcessing(true);
    try {
      // First check risk with AI
      const riskResponse = await axios.post('/api/agents/admin', {
        context: `Refund Amount: ₹${amount}, Order History: ${transactions.map(t => `Order ${t.orderId}: ₹${t.amount}, ${t.reason}`).join("; ")}`,
        task: 'fraud_risk_assessment',
        format: 'text-only'
      });

      const riskResult = riskResponse.data.result;
      // Parse risk result (simplified for demo)
      const riskMatch = riskResult.match(/Risk Level:\s*(High|Medium|Low)/i);
      const messageMatch = riskResult.match(/Message:\s*(.+)/i);

      setRiskLevel(riskMatch ? riskMatch[1] : "Medium");
      setRiskMessage(messageMatch ? messageMatch[1] : "Medium risk detected.");

      // Simulate refund processing
      alert(`Refund request of ₹${amount} submitted successfully!`);
    } catch (err: any) {
      alert('Mistral AI Error: ' + (err?.message || err));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Phoenix Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Refund Management</h1>
          <p className="text-sm text-slate-600">Process customer refund requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">Total: ₹{totalRefundAmount.toFixed(2)}</span>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Refund Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">📋 Refund Transactions</h2>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <RefundTransaction key={index} transaction={transaction} />
              ))}
            </div>
          </div>

          <RefundSummary total={totalRefundAmount} />
        </div>

        {/* Right Column - Refund Form & Risk Assessment */}
        <div className="lg:col-span-1 space-y-6">
          <RefundForm
            amount={amount}
            setAmount={setAmount}
            isProcessing={isProcessing}
            onSubmit={requestRefund}
          />

          <RiskIndicator
            riskLevel={riskLevel}
            riskMessage={riskMessage}
          />
        </div>
      </section>
    </div>
  );
}