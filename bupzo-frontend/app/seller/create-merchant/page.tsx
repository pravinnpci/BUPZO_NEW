"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMerchant() {
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [commissionRate, setCommissionRate] = useState(10.0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local notification state
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "+919876543211", // Default phone for seller
          email: "seller@bupzo.com",
          business_name: businessName,
          commission_rate: commissionRate,
          status: "APPROVED",
          kyc_details: {
            gstin: gstNumber,
            fssai: fssaiNumber,
          },
        }),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Merchant account created successfully!",
        });
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const errorData = await response.json();
        setNotification({
          type: "error",
          message: errorData.detail || "Failed to create merchant account",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "An unexpected connection error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-950 dark:text-white">Create Merchant Account</h2>
        </div>
        <div className="p-6">
          {notification && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-850"
                  : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-850"
              }`}
            >
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="businessName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-350 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-gray-500 transition"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="gstNumber" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                GSTIN Number
              </label>
              <input
                id="gstNumber"
                type="text"
                value={gstNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGstNumber(e.target.value)}
                placeholder="e.g., 29AABC1234F1Z5"
                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-350 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-gray-500 transition"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="fssaiNumber" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                FSSAI License Number
              </label>
              <input
                id="fssaiNumber"
                type="text"
                value={fssaiNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFssaiNumber(e.target.value)}
                placeholder="e.g., 12345678901234"
                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-350 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-gray-500 transition"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="commissionRate" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Commission Rate (%)
              </label>
              <input
                id="commissionRate"
                type="number"
                value={commissionRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommissionRate(parseFloat(e.target.value) || 10.0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-350 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-gray-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold rounded-lg text-sm transition disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}