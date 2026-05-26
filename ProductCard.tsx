import React from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  description?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, imageUrl, rating = 4.5, description }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="flex-1 p-4 space-y-2 flex flex-col">
        <h3 className="text-sm font-medium text-gray-900">
          <a href={`/products/${id}`} className="absolute inset-0">
            {name}
          </a>
        </h3>
        <p className="text-sm text-gray-500">{description || 'Premium Nagore Quality'}</p>
        <div className="flex items-center text-yellow-500">{'★'.repeat(Math.floor(rating))} ({rating})</div>
        <p className="text-xl font-bold text-gray-900">₹{price.toFixed(2)}</p>
        <button className="mt-4 w-full bg-dusty-mauve text-white py-2 px-4 rounded-md hover:bg-charcoal transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;