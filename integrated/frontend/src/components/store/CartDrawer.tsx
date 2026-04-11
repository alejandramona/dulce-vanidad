import { X, Trash2, Minus, Plus } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { cart, cartTotal, cartCount, removeFromCart, updateCartQuantity } = useStore();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg text-card-foreground">
            Su pedido <span className="text-muted-foreground font-normal">({cartCount} artículo{cartCount !== 1 ? "s" : ""})</span>
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Su carrito está vacío</p>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 bg-background rounded-xl p-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  width={64}
                  height={64}
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{item.product.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-card-foreground whitespace-nowrap">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold text-card-foreground">
              <span>Importe total ({cartCount} artículo{cartCount !== 1 ? "s" : ""})</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="w-full btn-primary text-center py-3"
            >
              Preparar el pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
