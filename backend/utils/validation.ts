export const isValidPrice = (price: number): boolean => {
  return price >= 0;
};

export const isValidStock = (stock: number): boolean => {
  return Number.isInteger(stock) && stock >= 0;
};
