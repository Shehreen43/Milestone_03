'use client';
import useBasketStore from "@/store/store";
import { Product } from "@/sanity.types";
import { useEffect, useState } from "react";

interface AddToBasketButtonProps {
  product: Product;
  disabled?: boolean;
}

const AddToBasketButton = ({ product, disabled }: AddToBasketButtonProps) => {
  const { addItem, removeItem, getItemCount } = useBasketStore();
  const itemCount = getItemCount(product._id);

  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on the client-side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const isStockExceeded = itemCount >= (product.stock || 0);
  const stockRemaining = (product.stock || 0) - itemCount;

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Error Message for Stock Exceeded */}
      {isStockExceeded && (
        <div className="w-full mb-2">
          <p className="text-sm text-red-600 font-medium text-center">
            You’ve reached the maximum stock limit for this product.
          </p>
        </div>
      )}

      {/* Warning Message for Low Stock */}
      {!isStockExceeded && stockRemaining > 0 && stockRemaining <= 3 && (
        <div className="w-full mb-2">
          <p className="text-sm text-yellow-500 font-medium text-center">
            Hurry! Only {stockRemaining} left in stock.
          </p>
        </div>
      )}

      {/* Buttons and Item Count */}
      <div className="flex items-center space-x-2">
        {/* Decrease Button */}
        <button
          onClick={() => removeItem(product._id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
          ${itemCount === 0 ? "bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
          disabled={itemCount === 0 || disabled}
        >
          <span className="text-xl font-bold">-</span>
        </button>

        {/* Item Count */}
        <span className="w-8 text-center font-bold">{itemCount}</span>

        {/* Increase Button */}
        <button
          onClick={() => {
            if (!isStockExceeded) {
              addItem(product);
            }
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
          ${isStockExceeded ? "bg-gray-100 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          disabled={isStockExceeded || disabled}
        >
          <span className="text-xl font-bold text-white">+</span>
        </button>
      </div>
    </div>
  );
};

export default AddToBasketButton;
