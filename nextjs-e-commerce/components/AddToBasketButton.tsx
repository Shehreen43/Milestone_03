import useBasketStore from "@/app/store/store";
import { Product } from "@/sanity.types";
import { useEffect, useState } from "react";


interface AddToBasketButtonProps {
    product: Product;
    disabled?: boolean;
}

const AddToBasketButton = ({product, disabled}: AddToBasketButtonProps) => {
  const {addItem, removeItem, getItemCount} = useBasketStore();
  const itemCount = getItemCount(product._id);

  const [isClient, setIsClient] = useState(false);

  //Use useEffect to set isClient to true after component mounts
  //This ensures that the component only renders on the client-side
  //preventing hydration errors due to server/mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return null
  }
  
    return (
    <div className="">

    </div>
  )
}

export default AddToBasketButton;