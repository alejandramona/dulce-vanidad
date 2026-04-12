import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/store/Header";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import emailjs from "emailjs-com";

interface OrderData {
  code: string;
  date: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  total: number;
  count: number;
  customer: { name: string; phone: string; email: string };
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const { whatsappNumber } = useStore();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dv_last_order");
    if (saved) setOrder(JSON.parse(saved));
  }, []);

  const code = searchParams.get("code") || order?.code || "0000-0000";

  const handleCoordinate = () => {
    let msg = `*SEGUIMIENTO PEDIDO - DULCE VANIDAD*\n\n`;

msg += `*Orden:* #${code}\n`;
msg += `*Cliente:* ${order?.customer.name}\n`;
msg += `*Teléfono:* ${order?.customer.phone}\n`;

if (order?.customer.email) {
  msg += `*Email:* ${order.customer.email}\n`;
}

msg += `\n*PRODUCTOS:*\n`;

order?.items.forEach(item => {
  msg += `- ${item.quantity}x ${item.name} (${formatPrice(item.price / item.quantity)})\n`;
});

msg += `\n*Total:* ${formatPrice(order?.total || 0)}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">Seguimiento del estado de su pedido</h2>

          {/* Shopping bag icon */}
          <div className="flex justify-center mb-3">
            <div className="text-6xl">🛍️</div>
          </div>

          <p className="text-primary font-bold text-lg mb-6">En espera de pago</p>

          {/* Order info grid */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-6 border-b pb-6">
            <div>
              <p className="text-muted-foreground font-medium">Estado del pedido</p>
              <p className="text-primary font-semibold">En espera de pago</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Fecha del pedido</p>
              <p className="font-semibold text-card-foreground">{order?.date || new Date().toLocaleDateString("es-CO")}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Código de pedido</p>
              <p className="font-semibold text-card-foreground">{code}</p>
            </div>
          </div>

          {/* Order items */}
          {order && (
            <div className="text-left mb-6">
              <h3 className="font-bold text-card-foreground mb-3">Su pedido</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" width={48} height={48} loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                    <p className="text-xs text-primary">({item.quantity} artículo{item.quantity > 1 ? "s" : ""})</p>
                  </div>
                  <p className="font-semibold text-card-foreground">{formatPrice(item.price)}</p>
                </div>
              ))}

              <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total artículos ({order.count} artículo{order.count > 1 ? "s" : ""})</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Importe del envío</span>
                  <span className="italic">Por acordar</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-card-foreground pt-2">
                  <span>Importe total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact section */}
          <div className="border-t pt-6">
            <p className="font-bold text-card-foreground mb-1">Nos pondremos en contacto en breve</p>
            <p className="text-sm text-muted-foreground mb-4">
              Si desea agilizar el proceso, póngase en contacto con nosotros para finalizar el pago y los detalles de la entrega:
            </p>
            <button onClick={handleCoordinate} className="btn-primary flex items-center justify-center gap-2 mx-auto">
              <MessageCircle className="w-5 h-5" /> COORDINAR PAGO
            </button>
            <Link to="/" className="block mt-3 text-primary font-medium text-sm hover:underline">
              CONTINUAR COMPRANDO
            </Link>
          </div>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default OrderConfirmation;
