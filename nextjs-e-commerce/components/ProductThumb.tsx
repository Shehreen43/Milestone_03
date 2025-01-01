import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductThumb = ({ product }: { product: Product }) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hoverEffect ${isOutOfStock ? "opacity-50" : ""}`}
    >
      <div className="relative aspect-square w-full h-full overflow-hidden">
       {product.image && (
        <Image 
        src={imageUrl(product.image).url()}
        alt={product.name || "Product image"}
        fill
        sizes="(max-width: 768px) 100vh, (max-width: 1200px) 50vw, 33vw"
        className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
       )}
       
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 ">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
    {/* product detail */}
    <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
            {product.name}
        </h2>

        <p>
            {product.description
            ?.map((block) => 
            block._type === "block"
            ? block.children?.map((child) => child.text).join('') 
            : '' )
            .join("") || "No description available"}
        </p>
        <p className="mt-2 text-lg font-bold text-gray-900">
            {product.price?.toFixed(2)}
        </p>
    </div>

    </Link>
  );
};

export default ProductThumb;
