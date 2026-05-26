'use client';

import { useState } from 'react';

export default function SpinWin() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{ type: string; value: number } | null>(null);
  const [message, setMessage] = useState('');

  const rewards = [
    { type: 'DISCOUNT', value: 10, description: '10% Discount' },
    { type: 'CASHBACK', value: 50, description: '₹50 Cashback' },
    { type: 'FREE_SHIPPING', value: 0, description: 'Free Shipping' },
  ];

  const handleSpin = () => {
    setIsSpinning(true);
    setMessage('Spinning...');

    setTimeout(() => {
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      setReward(randomReward);
      setMessage(`You won: ${randomReward.description}`);
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="bg-almond-silk p-6 rounded-lg shadow-lg">
      <h3 className="font-heading text-charcoal text-xl mb-4">Spin & Win</h3>
      <div className="flex justify-center items-center mb-4">
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`bg-charcoal text-white py-3 px-6 rounded-full ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dusty-mauve transition'}`}
        >
          {isSpinning ? 'Spinning...' : 'Spin'}
        </button>
      </div>
      {message && (
        <p className="text-dim-grey dark:text-dust-grey mb-4">{message}</p>
      )}
      {reward && (
        <div className="bg-white dark:bg-charcoal p-4 rounded-lg">
          <p className="text-charcoal dark:text-almond-silk font-bold">
            {reward.type === 'DISCOUNT' ? `🎁 ${reward.value}% Discount` :
             reward.type === 'CASHBACK' ? `💰 ₹${reward.value} Cashback` : '🚚 Free Shipping'}
          </p>
        </div>
      )}
    </div>
  );
}