import Image from 'next/image';
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  onAddToCart: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  rating = 5,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-dustGrey rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 border border-dustGrey/30">
      <div className="relative h-64 w-full overflow-hidden rounded-md">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-medium text-charcoal dark:text-white truncate">{name}</h3>
        <div className="flex items-center mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4 text-yellow-400",
                i < Math.floor(rating) ? "fill-current" : "opacity-30"
              )}
            />
          ))}
        </div>
        <div className="mt-2">
          <span className="text-charcoal dark:text-white font-semibold">${price.toFixed(2)}</span>
        </div>
        <Button
          onClick={onAddToCart}
          className="mt-4 w-full bg-charcoal hover:bg-dimGrey text-white transition-colors"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}