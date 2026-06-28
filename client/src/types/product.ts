export interface ICategory {
  id?: number;
  name: string;
}

export interface IProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: ICategory;
  promo: boolean;
  visible?: boolean;
  discountType?: "PERCENTAGE" | "VALUE";
  discountValue?: number;
  stock: number;
  mechanics?: string;
  players?: string;
  editor?: string;
  imageUrl: string;
  otherImages?: string[];
  duracao?: string;
  idadeRecomendada?: string;
}

export const getEffectivePrice = (product: IProduct): number => {
  if (product.promo && product.discountType && product.discountValue !== undefined) {
    if (product.discountType === "PERCENTAGE") {
      const discount = product.price * (product.discountValue / 100);
      return Math.max(0, parseFloat((product.price - discount).toFixed(2)));
    } else if (product.discountType === "VALUE") {
      return Math.max(0, parseFloat((product.price - product.discountValue).toFixed(2)));
    }
  }
  return product.price;
};

export const getDiscountPercentage = (product: IProduct): number => {
  if (!product.promo || !product.price) return 0;
  if (product.discountType === "PERCENTAGE" && product.discountValue !== undefined) {
    return Math.floor(product.discountValue);
  }
  if (product.discountType === "VALUE" && product.discountValue !== undefined) {
    return Math.floor((product.discountValue / product.price) * 100);
  }
  return 0;
};