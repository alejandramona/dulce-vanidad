import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/store/Header";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { Mail, Shield, Truck, CreditCard } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Checkout = () => {
  const { cart, cartTotal, cartCount, clearCart, whatsappNumber } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(() => { try { return JSON.parse(localStorage.getItem("dv_customer_info") || "{}").name || ""; } catch { return ""; } });
  const [phone, setPhone] = useState(() => { try { return JSON.parse(localStorage.getItem("dv_customer_info") || "{}").phone || ""; } catch { return ""; } });
  const [email, setEmail] = useState(() => { try { return JSON.parse(localStorage.getItem("dv_customer_info") || "{}").email || ""; } catch { return ""; } });
  const [comments, setComments] = useState("");
  const [coupon, setCoupon] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [countryCode] = useState("+57");
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">No hay productos en su pedido</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-4">Ir a la tienda</button>
        </div>
      </div>
    );
  }

  const orderCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) { alert("Por favor complete su nombre y teléfono"); return; }
    setLoading(true);

    // Mensaje WhatsApp
    let msg = `*NUEVO PEDIDO - DULCE VANIDAD*\n\n`;
    msg += `*Orden:* #${orderCode}\n`;
    msg += `*Cliente:* ${name.trim()}\n`;
    msg += `*Teléfono:* ${countryCode} ${phone.trim()}\n`;
    if (email.trim()) msg += `*Email:* ${email.trim()}\n`;
    msg += `\n*PRODUCTOS:*\n`;
    cart.forEach(item => { msg += `- ${item.quantity}x ${item.product.name} (${formatPrice(item.product.price)})\n`; });
    msg += `\n*Total:* ${formatPrice(cartTotal)}`;
    if (comments.trim()) msg += `\n\n*Comentario:* ${comments.trim()}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");

    // Guardar en backend
    try {
      await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: `${countryCode} ${phone.trim()}`,
          customerEmail: email.trim(),
          customerNotes: comments.trim(),
          items: cart.map(item => ({
            product: item.product.id || item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0] || "",
          })),
          subtotal: cartTotal,
          total: cartTotal,
          couponCode: coupon.trim() || null,
          paymentMethod: "whatsapp",
        }),
      });
    } catch (err) {
      console.error("No se pudo guardar el pedido en el servidor:", err);
    }

    if (saveInfo) {
      localStorage.setItem("dv_customer_info", JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }));
    }

    const confirmData = {
      code: orderCode,
      date: new Date().toLocaleDateString("es-CO"),
      items: cart.map(item => ({
        name: item.product.name,
        image: item.product.images?.[0] || "",
        quantity: item.quantity,
        price: item.product.price * item.quantity,
      })),
      total: cartTotal,
      count: cartCount,
      customer: { name: name.trim(), phone: `${countryCode} ${phone.trim()}`, email: email.trim() },
    };

    localStorage.setItem("dv_last_order", JSON.stringify(confirmData));
    clearCart();
    setLoading(false);
    navigate(`/confirmacion?code=${orderCode}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Enviar pedido</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">1</span>
                <h3 className="font-bold text-card-foreground">Sus datos</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Nombre</label>
                  <input type="text" placeholder="Introduzca su nombre" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Teléfono móvil</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm shrink-0">
                      <span>🇨🇴</span><span>{countryCode}</span>
                    </div>
                    <input type="tel" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-foreground" maxLength={15} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email (opcional)</label>
                  <input type="email" placeholder="tu_email@proveedor.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1" maxLength={255} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => setSaveInfo(!saveInfo)}
                    className={`w-10 h-5 rounded-full transition-colors ${saveInfo ? "bg-primary" : "bg-muted"} relative`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-card rounded-full transition-transform shadow ${saveInfo ? "left-5" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm text-muted-foreground">Guardar información para próxima compra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-card-foreground mb-4">Su pedido</h3>
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" width={56} height={56} loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{item.product.name}</p>
                    <p className="text-xs text-primary">({item.quantity} artículo{item.quantity > 1 ? "s" : ""})</p>
                  </div>
                  <p className="font-semibold text-card-foreground whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total artículos ({cartCount})</span><span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Importe del envío</span><span className="italic">Por acordar</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-card-foreground pt-2">
                  <span>Importe total</span><span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-card-foreground mb-3">Aplicar cupón</h3>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-3">
                  <span className="text-muted-foreground mr-2">🎟️</span>
                  <input type="text" placeholder="Introduzca el cupón aquí" value={coupon} onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-foreground outline-none text-sm" />
                </div>
                <button className="bg-muted text-muted-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition">Aplicar</button>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-card-foreground mb-3">Añadir un comentario</h3>
              <textarea placeholder="Añade aquí tus comentarios sobre este pedido." value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground min-h-[80px] resize-none text-sm" maxLength={500} />
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary py-3.5 text-lg disabled:opacity-60">
              {loading ? "Enviando..." : "ENVIAR PEDIDO"}
            </button>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-muted-foreground">
            <div><h4 className="font-semibold text-card-foreground mb-2">Formas de pago</h4><div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Transferencia bancaria</div></div>
            <div><h4 className="font-semibold text-card-foreground mb-2">Métodos de envío</h4><div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Entrega a domicilio</div></div>
            <div><h4 className="font-semibold text-card-foreground mb-2">Contacto</h4><div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">alejandramona501@gmail.com</span></div></div>
            <div><h4 className="font-semibold text-card-foreground mb-2">Seguridad</h4><div className="flex items-center gap-2"><Shield className="w-4 h-4" /> SSL</div></div>
          </div>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default Checkout;
