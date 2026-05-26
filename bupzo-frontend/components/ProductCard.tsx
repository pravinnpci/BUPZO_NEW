'use client';

import Image from 'next/image';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  isCombo?: boolean;
}

export default function ProductCard({ id, name, price, imageUrl, description, isCombo }: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image'}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-charcoal dark:text-almond-silk text-lg font-semibold mb-1">{name}</h3>
        {isCombo && (
          <span className="bg-dusty-mauve text-white text-xs px-2 py-1 rounded-full mb-2 inline-block">Combo</span>
        )}
        <p className="text-dim-grey dark:text-dust-grey text-sm mb-2">{description || 'High-quality product'}</p>
        <p className="text-charcoal dark:text-almond-silk font-bold">₹{price.toFixed(2)}</p>
      </div>
    </div>
  );
}