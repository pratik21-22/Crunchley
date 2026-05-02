import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId?: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  slug?: string;
  flavor?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  increaseQuantity: (id: string | number) => void;
  decreaseQuantity: (id: string | number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function isMongoObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value)
}

export const useCartStore = create<CartState>()(
  persist<CartState>(
    (set, get): CartState => ({
      items: [] as CartItem[],

      addItem: (item, quantity = 1) => {
        const normalizedId = normalizeId(item.productId || item._id || item.id);
        const safeQuantity = Math.max(1, quantity);

        if (!isMongoObjectId(normalizedId)) {
          console.warn("Rejected invalid cart product ID:", normalizedId)
          return
        }

        set((state) => {
          const existingItem = state.items.find((i) => normalizeId(i.productId || i._id || i.id) === normalizedId);
          
          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((i) =>
                normalizeId(i.productId || i._id || i.id) === normalizedId
                  ? { ...i, id: normalizedId, productId: normalizedId, _id: normalizedId, quantity: i.quantity + safeQuantity }
                  : i
              ),
            };
          }
          
          // Add new item
          return {
            items: [
              ...state.items,
              { ...item, id: normalizedId, productId: normalizedId, _id: normalizedId, quantity: safeQuantity },
            ],
          };
        });
      },

      removeItem: (id) => {
        const normalizedId = normalizeId(id);
        set((state) => ({
          items: state.items.filter((i) => normalizeId(i.productId || i._id || i.id) !== normalizedId),
        }));
      },

      updateQuantity: (id, quantity) => {
        const normalizedId = normalizeId(id);
        set((state) => ({
          items: state.items.map((i) =>
            normalizeId(i.productId || i._id || i.id) === normalizedId
              ? { ...i, id: normalizedId, productId: normalizedId, _id: normalizedId, quantity: Math.max(1, quantity) }
              : i
          ),
        }));
      },

      increaseQuantity: (id) => {
        const normalizedId = normalizeId(id);
        set((state) => ({
          items: state.items.map((i) =>
            normalizeId(i.productId || i._id || i.id) === normalizedId
              ? { ...i, id: normalizedId, productId: normalizedId, _id: normalizedId, quantity: i.quantity + 1 }
              : i
          ),
        }));
      },

      decreaseQuantity: (id) => {
        const normalizedId = normalizeId(id);
        set((state) => ({
          items: state.items.map((i) =>
            normalizeId(i.productId || i._id || i.id) === normalizedId
              ? { ...i, id: normalizedId, productId: normalizedId, _id: normalizedId, quantity: Math.max(1, i.quantity - 1) }
              : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "crunchley-cart-storage", // name of item in localStorage
      storage: createJSONStorage(() => localStorage), // explicitly use localStorage
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CartState> | undefined;

        if (!state || !Array.isArray(state.items)) {
          return { items: [] } as unknown as CartState;
        }

        const migratedItems = state.items
          .map((item) => {
            const normalizedId = normalizeId(item.productId || item._id || item.id);
            if (!isMongoObjectId(normalizedId)) {
              return null;
            }

            return {
              ...item,
              id: normalizedId,
              productId: normalizedId,
              _id: normalizedId,
              quantity: Math.max(1, Number(item.quantity) || 1),
            };
          })
          .filter(Boolean) as CartItem[];

        return {
          ...state,
          items: migratedItems,
        } as unknown as CartState;
      },
    }
  )
);
