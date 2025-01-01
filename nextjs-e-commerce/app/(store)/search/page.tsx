import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/sanity.types";
import { searchProductByName } from "@/sanity/lib/product/searchProductByName";

async function SearchPage({
  searchParams,
}: {
  searchParams: { query: string };
}) {
  const { query } = searchParams;
  const response = await searchProductByName(query);

  // Check if response is an array or an object with 'data'
  let products: Product[] = [];

  if (Array.isArray(response)) {
    products = response; // If it's an array, use it directly
  } else if (response.data) {
    products = response.data; // If it's an object with 'data', use that
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">
            No products found for: <span className="text-red-500">{query}</span>
          </h1>
          <p className="text-gray-600 text-center">
            Try searching with different keywords.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search Results for: <span className="text-blue-500">{query}</span>
        </h1>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

export default SearchPage;
