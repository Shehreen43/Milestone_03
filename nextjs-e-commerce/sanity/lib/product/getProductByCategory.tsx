import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live";

export const getProductsCategory = async (categorySlug: string) => {
    const PRODUCT_BY_CATEGORY_QUERY = defineQuery(`*[_type == "product" && slug.current == $categorySlug] | order(name asc)`);

    try {
        //Use sanityFetch to send the query with the slug as a parameter
        const products = await sanityFetch({
            query: PRODUCT_BY_CATEGORY_QUERY,
            params: {
                categorySlug,
            }
        });

        //Return te product data or null slug as a parameter
       return products.data || null;
    } catch (error) {
        console.error("Error fetching product by category:", error);
        
        return [];
    }
}