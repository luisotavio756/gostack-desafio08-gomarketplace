import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();

      const items = await AsyncStorage.getItem('@GoMarketPlaceCart');

      if(!!items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    let productExists = false;

    const updatedProducts = products.map((item: Product) => {
      if(item.id === product.id) {
        productExists = true;

        return {
          ...item,
          quantity: item.quantity + 1
        }
      }

      return item;
    });

    let items = [] as Product[];

    if(!!productExists) {
      items = updatedProducts;
    }else {
      items = [
        ...products,
        {
          ...product,
          quantity: 1
        }
      ]
    }

    setProducts(items);

    await AsyncStorage.setItem('@GoMarketPlaceCart', JSON.stringify(items));

  }, [products]);

  const increment = useCallback(async (id: string) => {
    let updatedProducts = products.map((item: Product) => {
      if(item.id === id) {
        return {
          ...item,
          quantity: item.quantity + 1
        }
      }

      return item;
    });

    setProducts(updatedProducts);

    await AsyncStorage.setItem('@GoMarketPlaceCart', JSON.stringify(updatedProducts));
  }, [products]);

  const decrement = useCallback(async (id: string) => {
    let updatedProducts = products.map((item: Product) => {
      if(item.id === id) {
        return {
          ...item,
          quantity: item.quantity - 1
        }
      }

      return item;
    }).filter((item: Product) => item.quantity >= 1);

    setProducts(updatedProducts);

    await AsyncStorage.setItem('@GoMarketPlaceCart', JSON.stringify(updatedProducts));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
