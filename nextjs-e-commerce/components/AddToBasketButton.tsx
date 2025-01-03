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

  //Use useEffect to set isClient to true after component mounts
  //This ensures that the component only renders on the client-side
  //preventing hydration errors due to server/mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => removeItem(product._id)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
        ${itemCount === 0 ? "bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-slate-300"}`}
        disabled={itemCount === 0 || disabled}
      >
        <span
          className={`text-xl font-bold ${itemCount === 0}`}
        >
          -
        </span>
      </button>
      <span className="w-8 text-center font-bold">{itemCount}</span>
      <button
        onClick={() => addItem(product)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
        ${itemCount === 0 ? "bg-gray-100" : "bg-blue-500 hover:bg-blue-600"}`}
        disabled={disabled}
      >
        <span className="text-xl font-bold text-white"> + </span>
      </button>
    </div>
  );
};

export default AddToBasketButton;
