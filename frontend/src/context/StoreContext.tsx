import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  stock: number;
  condition: string;
  unit: string;
  soldOut: boolean;
  active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  products: Product[];
  loadingProducts: boolean;
  cart: CartItem[];
  addProduct: (product: Omit<Product, "id">, token: string) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>, token: string) => Promise<void>;
  deleteProduct: (id: string, token: string) => Promise<void>;
  toggleSoldOut: (id: string, token: string) => Promise<void>;
  refreshProducts: (token?: string) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categories: string[];
  whatsappNumber: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function normalizeProduct(p: any): Product {
  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description || "",
    images: p.images?.length ? p.images : (p.image ? [p.image] : []),
    stock: p.stock ?? 99,
    condition: p.condition || "Nuevo",
    unit: p.unit || "unidad",
    soldOut: p.soldOut ?? false,
    active: p.active ?? true,
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Todo"]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("dv_cart") || "[]"); } catch { return []; }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todo");

  useEffect(() => {
    localStorage.setItem("dv_cart", JSON.stringify(cart));
  }, [cart]);

  const refreshProducts = useCallback(async (token?: string) => {
    setLoadingProducts(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Admin (con token) → trae TODOS sin filtro
      // Tienda pública (sin token) → solo activos
      const url = `${API}/products`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Error cargando productos");
      const data = await res.json();
      const normalized = data.map(normalizeProduct);
      setProducts(normalized);
      const cats = ["Todo", ...Array.from(new Set<string>(normalized.map((p: Product) => p.category))).sort()];
      setCategories(cats);
    } catch (err) {
      console.error("No se pudieron cargar productos:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Ping cada 14 min para que Render no duerma el servidor
  useEffect(() => {
    const ping = () => fetch(`${API}/health`).catch(() => {});
    const interval = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">, token: string) => {
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(product),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    const created = await res.json();
    setProducts((prev) => [normalizeProduct(created), ...prev]);
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>, token: string) => {
    const res = await fetch(`${API}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? normalizeProduct(updated) : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string, token: string) => {
    const res = await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  }, []);

  const toggleSoldOut = useCallback(async (id: string, token: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    await updateProduct(id, { soldOut: !product.soldOut }, token);
  }, [products, updateProduct]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      products, loadingProducts, cart,
      addProduct, updateProduct, deleteProduct, toggleSoldOut, refreshProducts,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartTotal, cartCount,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      categories,
      whatsappNumber: "573192172733",
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};