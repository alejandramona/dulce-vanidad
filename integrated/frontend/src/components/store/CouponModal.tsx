import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
}

const CouponModal = ({ open, onClose }: CouponModalProps) => {
  const [code, setCode] = useState("");

  if (!open) return null;

  const handleApply = () => {
    if (!code.trim()) {
      toast.error("Introduzca un cupón");
      return;
    }
    toast.info("Cupón no válido o expirado");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-card-foreground text-center mb-2">Aplicar un descuento</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Aplique su cupón para ver los precios de los productos con descuento
        </p>
        <div className="flex items-center bg-background border border-border rounded-lg px-3 mb-4">
          <span className="text-muted-foreground mr-2">🎟️</span>
          <input
            type="text"
            placeholder="Introduzca el cupón aquí"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-foreground outline-none text-sm"
          />
        </div>
        <button onClick={handleApply} className="btn-primary w-full">
          Aplicar descuento
        </button>
      </div>
    </div>
  );
};

export default CouponModal;
