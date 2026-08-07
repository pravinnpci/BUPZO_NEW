'use client';
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8004';

type ShipmentTrackingProps = {
  mode: 'customer' | 'seller' | 'admin';
  user?: any;
  sellerId?: string;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  seller_name: string;
  total_amount: number;
  status: string;
  awb_code: string;
  aggregator: 'shiprocket' | 'nimbuspost';
  courier_name: string;
  estimated_delivery: string;
  seller_pin: string;
  seller_lat: number;
  seller_lng: number;
  seller_address: string;
  customer_pin: string;
  customer_lat: number;
  customer_lng: number;
  customer_address: string;
  distance: number;
};

type TrackingEvent = {
  date: string;
  status: string;
  location: string;
  activity: string;
};

type TrackingData = {
  awb: string;
  current_status: string;
  tracking_url: string;
  events: TrackingEvent[];
};

// Mock data generator for fallback
const generateMockOrders = (mode: string): Order[] => {
  return [
    {
      id: 'ORD-001',
      order_number: '#10045',
      customer_name: 'John Doe',
      seller_name: 'Tech Gadgets Inc.',
      total_amount: 5499.00,
      status: 'In Transit',
      awb_code: 'SR-77382910',
      aggregator: 'shiprocket',
      courier_name: 'Delhivery',
      estimated_delivery: '2026-08-10',
      seller_pin: '110020',
      seller_lat: 28.5245,
      seller_lng: 77.2713,
      seller_address: 'Okhla Phase 2, New Delhi',
      customer_pin: '400001',
      customer_lat: 18.9322,
      customer_lng: 72.8264,
      customer_address: 'Fort, Mumbai, Maharashtra',
      distance: 1145,
    },
    {
      id: 'ORD-002',
      order_number: '#10046',
      customer_name: 'Jane Smith',
      seller_name: 'Fashion Hub',
      total_amount: 1299.50,
      status: 'Delivered',
      awb_code: 'NP-44930211',
      aggregator: 'nimbuspost',
      courier_name: 'Blue Dart',
      estimated_delivery: '2026-08-05',
      seller_pin: '560001',
      seller_lat: 12.9716,
      seller_lng: 77.5946,
      seller_address: 'MG Road, Bangalore',
      customer_pin: '600001',
      customer_lat: 13.0827,
      customer_lng: 80.2707,
      customer_address: 'Parrys, Chennai',
      distance: 345,
    },
    {
      id: 'ORD-003',
      order_number: '#10047',
      customer_name: 'Alex Johnson',
      seller_name: 'Home Essentials',
      total_amount: 890.00,
      status: 'Pending',
      awb_code: 'SR-99201834',
      aggregator: 'shiprocket',
      courier_name: 'Ecom Express',
      estimated_delivery: '2026-08-12',
      seller_pin: '302001',
      seller_lat: 26.9124,
      seller_lng: 75.7873,
      seller_address: 'C Scheme, Jaipur',
      customer_pin: '110001',
      customer_lat: 28.6304,
      customer_lng: 77.2177,
      customer_address: 'Connaught Place, New Delhi',
      distance: 270,
    }
  ];
};

const generateMockTracking = (status: string): TrackingData => {
  const events: TrackingEvent[] = [
    { date: '2026-08-05 10:00 AM', status: 'Order Created', location: 'System', activity: 'Manifest generated' },
    { date: '2026-08-05 02:30 PM', status: 'Picked Up', location: 'Seller Facility', activity: 'Package picked up by courier' },
  ];
  
  if (status === 'In Transit' || status === 'Delivered') {
    events.push({ date: '2026-08-06 04:15 AM', status: 'In Transit', location: 'Hub Facility', activity: 'Arrived at sorting center' });
  }
  
  if (status === 'Delivered') {
    events.push({ date: '2026-08-06 10:00 AM', status: 'Out for Delivery', location: 'Delivery Facility', activity: 'Out for delivery' });
    events.push({ date: '2026-08-06 01:45 PM', status: 'Delivered', location: 'Customer Address', activity: 'Delivered successfully' });
  }

  return {
    awb: 'MOCK-AWB',
    current_status: status,
    tracking_url: 'https://tracking.example.com',
    events: events.reverse(), // Newest first
  };
};

export default function ShipmentTracking({ mode, user, sellerId }: ShipmentTrackingProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    // In a real app, fetch from API. Here we use mock data.
    const fetchOrders = async () => {
      setIsLoading(true);
      setError('');
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
        let url = `${API_BASE}/api/orders/tracking?limit=50`;
        if (mode === 'customer' && user?.id) url += `&user_id=${user.id}`;
        if (mode === 'seller' && sellerId) url += `&seller_id=${sellerId}`;
        // admin mode fetches all orders (no filter)
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const mapped: Order[] = (data.orders || []).map((o: any) => ({
            id: String(o.id),
            order_number: `#${String(o.id).slice(0, 8).toUpperCase()}`,
            customer_name: o.customer_name || 'Customer',
            seller_name: o.seller_name || 'Seller',
            total_amount: parseFloat(o.total_amount || 0),
            status: o.status || 'Pending',
            awb_code: o.awb_code || `MOCK-${String(o.id).slice(0, 6).toUpperCase()}`,
            aggregator: (o.aggregator || 'shiprocket') as 'shiprocket' | 'nimbuspost',
            courier_name: o.courier_name || 'Courier Partner',
            estimated_delivery: o.estimated_delivery || 'TBD',
            seller_pin: o.seller_pincode || '600001',
            seller_lat: 13.0827,
            seller_lng: 80.2707,
            seller_address: o.seller_address || 'Seller Address',
            customer_pin: o.delivery_pincode || '600001',
            customer_lat: 13.0827,
            customer_lng: 80.2707,
            customer_address: o.delivery_address || 'Customer Address',
            distance: 0,
          }));
          
          if (mapped.length > 0) {
            setOrders(mapped);
            setFilteredOrders(mapped);
            handleSelectOrder(mapped[0]);
          } else {
            // Fallback to mock data if no orders yet
            const mockData = generateMockOrders(mode);
            setOrders(mockData);
            setFilteredOrders(mockData);
            if (mockData.length > 0) handleSelectOrder(mockData[0]);
          }
        } else {
          throw new Error('Failed to fetch orders');
        }
      } catch (err) {
        console.warn('[ShipmentTracking] API failed, using mock:', err);
        const mockData = generateMockOrders(mode);
        setOrders(mockData);
        setFilteredOrders(mockData);
        if (mockData.length > 0) handleSelectOrder(mockData[0]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [mode, sellerId, user]);

  useEffect(() => {
    let filtered = orders;
    if (filter === 'Shiprocket') {
      filtered = orders.filter(o => o.aggregator === 'shiprocket');
    } else if (filter === 'NimbusPost') {
      filtered = orders.filter(o => o.aggregator === 'nimbuspost');
    } else if (['In Transit', 'Delivered', 'Pending'].includes(filter)) {
      filtered = orders.filter(o => o.status === filter);
    }
    setFilteredOrders(filtered);
  }, [filter, orders]);

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
    fetchTrackingData(order);
  };

  const fetchTrackingData = async (order: Order) => {
    setIsTrackingLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
      if (order.awb_code && !order.awb_code.startsWith('MOCK-')) {
        const res = await fetch(`${API_BASE}/api/tracking/${order.awb_code}?aggregator=${order.aggregator}`);
        if (res.ok) {
          const data = await res.json();
          setTrackingData({
            awb: order.awb_code,
            current_status: data.current_status || order.status,
            tracking_url: data.tracking_url || '#',
            events: (data.history || []).map((h: any) => ({
              date: h.date || new Date().toLocaleString(),
              status: h.status || 'In Transit',
              location: h.location || 'Transit Hub',
              activity: h.activity || h.status || 'Package in transit'
            }))
          });
          return;
        }
      }
      // Fallback to mock
      setTrackingData(generateMockTracking(order.status));
    } catch (err) {
      setTrackingData(generateMockTracking(order.status));
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const refreshTracking = () => {
    if (selectedOrder) {
      fetchTrackingData(selectedOrder);
    }
  };

  const copyAwb = () => {
    if (selectedOrder) {
      navigator.clipboard.writeText(selectedOrder.awb_code);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const stats = {
    total: orders.length,
    inTransit: orders.filter(o => o.status === 'In Transit').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    shiprocket: orders.filter(o => o.aggregator === 'shiprocket').length,
    nimbuspost: orders.filter(o => o.aggregator === 'nimbuspost').length,
  };

  return (
    <div className="flex flex-col h-full bg-[#050914] text-gray-100 p-4 md:p-6 font-sans">
      {/* Header & Stats */}
      <div className="bg-gradient-to-r from-[#0a0f1e] to-purple-900 rounded-2xl p-6 shadow-xl border border-gray-800 mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Shipment Tracking</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-gray-400 text-sm">Total Shipments</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-blue-400 text-sm">In Transit</div>
            <div className="text-2xl font-bold text-blue-300">{stats.inTransit}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-green-400 text-sm">Delivered</div>
            <div className="text-2xl font-bold text-green-300">{stats.delivered}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-purple-500/30">
            <div className="text-purple-400 text-sm">Shiprocket</div>
            <div className="text-2xl font-bold">{stats.shiprocket}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-blue-500/30">
            <div className="text-blue-400 text-sm">NimbusPost</div>
            <div className="text-2xl font-bold">{stats.nimbuspost}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Order List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-[#0f172a] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-[#162032]">
            <div className="flex flex-wrap gap-2">
              {['All', 'In Transit', 'Delivered', 'Pending', 'Shiprocket', 'NimbusPost'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border border-gray-800 rounded-xl bg-gray-800/20">
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedOrder?.id === order.id 
                      ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'border-gray-800 bg-[#162032] hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-100">{order.order_number}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-900/50 text-green-400' :
                      order.status === 'In Transit' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {mode === 'customer' ? order.seller_name : order.customer_name}
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <div className="text-xs text-gray-500">AWB Code</div>
                      <div className="text-sm font-medium">{order.awb_code}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs border ${
                      order.aggregator === 'shiprocket' 
                        ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' 
                        : 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                    }`}>
                      {order.aggregator === 'shiprocket' ? 'Shiprocket' : 'NimbusPost'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">No orders found.</div>
            )}
          </div>
        </div>

        {/* Right Panel: Tracking Details */}
        <div className="w-full lg:w-2/3 flex flex-col bg-[#0f172a] rounded-2xl border border-gray-800 shadow-xl overflow-hidden relative">
          {selectedOrder ? (
            <>
              {/* Map Visualization */}
              <div className="h-64 bg-[#0a0f1e] relative border-b border-gray-800 overflow-hidden flex items-center justify-center">
                {/* CSS Animated Route */}
                <div className="w-full max-w-lg mx-auto relative px-8">
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-800 -translate-y-1/2 rounded"></div>
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 rounded overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 bg-white/20 w-1/2 animate-[slide_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Points */}
                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-[#0a0f1e]"></div>
                      <div className="text-xs text-gray-400 mt-2 font-medium bg-[#0a0f1e] px-2 rounded">
                        Pickup<br/>{selectedOrder.seller_pin}
                      </div>
                    </div>
                    
                    {/* Animated Truck */}
                    {selectedOrder.status !== 'Delivered' && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-2xl animate-[bounce_1s_infinite]">
                        🚚
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] border-2 border-[#0a0f1e]"></div>
                      <div className="text-xs text-gray-400 mt-2 font-medium bg-[#0a0f1e] px-2 rounded text-center">
                        Delivery<br/>{selectedOrder.customer_pin}
                      </div>
                    </div>
                  </div>
                </div>
                
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `}} />
              </div>

              {/* Details & Timeline */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      {selectedOrder.awb_code}
                      <button 
                        onClick={copyAwb}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy AWB"
                      >
                        {copyFeedback ? '✓' : '📋'}
                      </button>
                    </h2>
                    <div className="text-sm text-gray-400 mt-1">
                      {selectedOrder.courier_name} • Est. Delivery: {selectedOrder.estimated_delivery}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={refreshTracking}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-gray-700"
                    >
                      <span className={isTrackingLoading ? 'animate-spin' : ''}>⟳</span> Refresh
                    </button>
                    <a 
                      href={trackingData?.tracking_url || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                      Track on Web ↗
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#162032] p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Sender</div>
                    <div className="font-medium text-gray-200">{selectedOrder.seller_name}</div>
                    <div className="text-sm text-gray-400 mt-1">{selectedOrder.seller_address}</div>
                  </div>
                  <div className="bg-[#162032] p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Receiver</div>
                    <div className="font-medium text-gray-200">{selectedOrder.customer_name}</div>
                    <div className="text-sm text-gray-400 mt-1">{selectedOrder.customer_address}</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Tracking History</h3>
                
                {isTrackingLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-4">
                        <div className="w-4 h-4 bg-gray-700 rounded-full mt-1"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : trackingData && trackingData.events.length > 0 ? (
                  <div className="relative border-l-2 border-gray-800 ml-3 pl-6 space-y-8">
                    {trackingData.events.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-[#0f172a] ${
                          idx === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-gray-600'
                        }`}></div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 mb-1">
                          <div className={`font-medium ${idx === 0 ? 'text-blue-400' : 'text-gray-300'}`}>
                            {event.status}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {event.date}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {event.activity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-4">No tracking events available yet.</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Order Selected</h3>
              <p>Select an order from the list to view its tracking details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
