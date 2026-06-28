import React from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  tracking_id?: string;
  shipping_partner?: string;
  payment_gateway?: string;
  created_at: string;
  items?: OrderItem[];
}

interface CustomerOrdersProps {
  customerOrders: Order[];
  user: any;
  mockUserId: string;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  customerOrders,
  user,
  mockUserId
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading">Track Orders</h2>
        <p className="text-xs text-zinc-500 mt-1">Monitor real-time delivery timelines, dispatch alerts, and Stitch Sandboxing ledger.</p>
      </div>

      <div className="space-y-4">
        {customerOrders.map((ord: any) => (
          <div key={ord.id} className="bg-white dark:bg-[#15131b] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-mono">ORDER ID</span>
                <span className="block font-bold text-sm text-[#3874ff]">{ord.id}</span>
                <span className="block font-mono text-[10px] text-zinc-400 mt-1">
                  Placed: {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-mono">TOTAL VALUE</span>
                <span className="block font-bold text-sm">₹{ord.total_amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Shipment Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${ord.status === 'DELIVERED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                  <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">{ord.status}</span>
                </div>
                {ord.tracking_id && (
                  <p className="text-[10px] font-mono text-zinc-500">Tracking: {ord.tracking_id} ({ord.shipping_partner || 'Carrier Link'})</p>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Payment Details</span>
                <p className="font-semibold">{ord.payment_gateway || 'Stitch Money'} Sandbox Gateway</p>
                <span className="text-[9px] bg-green-100/10 text-green-500 px-2 py-0.5 rounded font-extrabold uppercase">Paid</span>
              </div>
            </div>

            {/* Display Order Items if available */}
            {Array.isArray(ord.items) && ord.items.length > 0 && (
              <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Consignment Package</span>
                {ord.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px] font-medium">
                    <span className="text-zinc-600 dark:text-zinc-400">1x {item.name}</span>
                    <span className="font-mono text-zinc-500">₹{item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {customerOrders.length === 0 && (
          <div className="bg-white dark:bg-[#15131b] p-12 text-center text-zinc-400 rounded-xl border border-zinc-200 dark:border-zinc-800">
            No transaction records found. Start shopping to create your first ledger entry!
          </div>
        )}
      </div>
    </div>
  );
};
