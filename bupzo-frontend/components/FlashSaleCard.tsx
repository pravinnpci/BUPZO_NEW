'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface FlashSaleCardProps {
  id: number;
  name: string;
  price: number;
  discountPercent: number;
  imageUrl: string;
  endTime: string;
}

export default function FlashSaleCard({ id, name, price, discountPercent, imageUrl, endTime }: FlashSaleCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const saleEndDate = new Date(endTime);
      const now = new Date();
      const difference = saleEndDate.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('00h 00m 00s');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden relative">
      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
        {discountPercent}% OFF
      </div>
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || 'https://via.placeholder.com/300x200?text=Flash+Sale'}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-charcoal dark:text-almond-silk text-lg font-semibold mb-1">{name}</h3>
        <div className="flex items-center mb-2">
          <p className="text-dim-grey dark:text-dust-grey line-through text-sm mr-2">₹{Math.round(price * (1 + discountPercent / 100))}</p>
          <p className="text-charcoal dark:text-almond-silk font-bold">₹{price.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-dim-grey dark:text-dust-grey">Ends in: {timeLeft}</p>
          <button className="bg-charcoal text-white text-xs px-3 py-1 rounded-full hover:bg-dusty-mauve transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}