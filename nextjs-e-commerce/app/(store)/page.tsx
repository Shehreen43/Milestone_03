import NewYearBanner from "@/components/NewYearBanner";
import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/product/getAllCategories";
import { getAllProducts } from "@/sanity/lib/product/getAllProducts";


export default async function Home() {

  const products = await getAllProducts()
  const categories = await getAllCategories()
  return (
   <div>
   <NewYearBanner />
    <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
    <ProductsView products={products} categories={categories} />
    </div>
   </div>
  );
}
