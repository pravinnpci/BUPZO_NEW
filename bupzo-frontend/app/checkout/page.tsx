'use client';

import Checkout from '@/components/Checkout';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-dust-grey p-8">
      <div className="max-w-4xl mx-auto">
        <Checkout />
      </div>
    </div>
  );
}