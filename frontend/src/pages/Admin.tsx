import { useState, useRef, useEffect } from "react";
import { useStore, Product } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { Trash2, Edit, Plus, X, Ban, CheckCircle, LogOut, ImagePlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORIES = ["Cuidado Capilar", "Cuidado Corporal", "Maquillaje y Cuidado Facial"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleSoldOut, refreshProducts } = useStore();
  const [token, setToken] = useState(() => localStorage.getItem("dv_admin_token") || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [reloading, setReloading] = useState(false);

  const reloadProducts = (tok: string) => {
    setReloading(true);
    refreshProducts(tok).finally(() => setReloading(false));
  };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Cuidado Capilar");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState("99");
  const [formImages, setFormImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Verificar token guardado al cargar
  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (r.ok) {
            setAuthenticated(true);
            reloadProducts(token);
          } else {
            localStorage.removeItem("dv_admin_token");
            setToken("");
          }
        })
        .catch(() => { localStorage.removeItem("dv_admin_token"); setToken(""); });
    }
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
    } catch { toast.error("Error cargando pedidos"); }
    finally { setOrdersLoading(false); }
  };

  useEffect(() => {
    if (authenticated && activeTab === "orders") loadOrders();
  }, [authenticated, activeTab]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { toast.error("Completa usuario y contraseña"); return; }
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Credenciales incorrectas"); return; }
      localStorage.setItem("dv_admin_token", data.token);
      setToken(data.token);
      setAuthenticated(true);
      reloadProducts(data.token);
      toast.success("Bienvenida al panel admin");
    } catch { toast.error("Error de conexión con el servidor"); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("dv_admin_token");
    setToken(""); setAuthenticated(false);
    setUsername(""); setPassword("");
  };

  const resetForm = () => {
    setFormName(""); setFormPrice(""); setFormCategory("Cuidado Capilar");
    setFormDescription(""); setFormStock("99"); setFormImages([]);
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (product: Product) => {
    setFormName(product.name); setFormPrice(product.price.toString());
    setFormCategory(product.category); setFormDescription(product.description);
    setFormStock(product.stock.toString()); setFormImages(product.images);
    setEditingId(product.id); setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setFormImages((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPrice.trim()) { toast.error("Nombre y precio son obligatorios"); return; }
    if (formImages.length === 0) { toast.error("Sube al menos una imagen"); return; }
    setSaving(true);
    try {
      const data = {
        name: formName.trim(), price: parseFloat(formPrice),
        category: formCategory, description: formDescription.trim(),
        images: formImages, stock: parseInt(formStock) || 99,
        condition: "Nuevo", unit: "unidad", soldOut: false, active: true,
      };
      if (editingId) {
        await updateProduct(editingId, data, token);
        toast.success("Producto actualizado");
      } else {
        await addProduct(data, token);
        toast.success("Producto creado");
      }
      resetForm();
    } catch (err: any) { toast.error(err.message || "Error guardando producto"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await deleteProduct(id, token); toast.success("Producto eliminado"); }
    catch (err: any) { toast.error(err.message || "Error eliminando"); }
  };

  const handleToggleSoldOut = async (id: string, current: boolean) => {
    try {
      await toggleSoldOut(id, token);
      toast.success(current ? "Producto disponible" : "Producto marcado como agotado");
    } catch (err: any) { toast.error(err.message || "Error"); }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error actualizando estado");
      toast.success("Estado actualizado");
      loadOrders();
    } catch { toast.error("No se pudo actualizar el estado"); }
  };

  // --- LOGIN SCREEN ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-2xl p-8 shadow-lg w-full max-w-sm mx-4">
          <h1 className="text-2xl font-bold text-card-foreground mb-1 text-center">Panel Admin</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">Dulce Vanidad</p>
          <div className="space-y-3">
            <input
              type="text" placeholder="Usuario"
              value={username} onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground"
            />
            <input
              type="password" placeholder="Contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground"
            />
            <button onClick={handleLogin} disabled={authLoading} className="w-full btn-primary py-2.5 disabled:opacity-60">
              {authLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN PANEL ---
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-primary-foreground font-bold text-lg">Admin - Dulce Vanidad</h1>
        <div className="flex items-center gap-2">
          {activeTab === "products" && (
            <button onClick={() => { setShowForm(true); setEditingId(null); }}
              className="bg-card text-card-foreground rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          )}
          <button onClick={handleLogout} className="text-primary-foreground p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab("products")}
          className={`flex-1 py-3 text-sm font-medium transition ${activeTab === "products" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          Productos ({products.length})
        </button>
        <button onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 text-sm font-medium transition ${activeTab === "orders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          Pedidos
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/40" onClick={resetForm} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
            <button onClick={resetForm} className="absolute top-3 right-3 text-muted-foreground"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-card-foreground mb-4">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Nombre</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1" maxLength={200} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Precio (COP)</label>
                <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} step="1" min="0"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Categoría</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Stock</label>
                <input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Descripción</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 min-h-[60px] resize-none" maxLength={500} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Imágenes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button onClick={() => setFormImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition">
                    <ImagePlus className="w-6 h-6" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full btn-primary py-2.5 disabled:opacity-60">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {/* PRODUCTOS */}
        {activeTab === "products" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => reloadProducts(token)}
                disabled={reloading}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> Actualizar
              </button>
            </div>

            {reloading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No hay productos aún</p>
                <button onClick={() => setShowForm(true)} className="btn-primary px-6">Crear primer producto</button>
              </div>
            ) : products.map((product) => (
              <div key={product.id} className={`bg-card rounded-xl p-4 shadow-sm flex items-center gap-4 ${product.soldOut ? "opacity-60" : ""}`}>
                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-card-foreground truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="font-bold text-card-foreground">{formatPrice(product.price)}</p>
                  <p className="text-xs text-muted-foreground">Stock: {product.stock}{product.soldOut && " • AGOTADO"}</p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(product)} className="p-2 text-primary hover:bg-accent rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleSoldOut(product.id, product.soldOut)} className="p-2 text-muted-foreground hover:bg-accent rounded-lg">
                    {product.soldOut ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-destructive hover:bg-accent rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-2">
              <button onClick={loadOrders} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" /> Actualizar
              </button>
            </div>
            {ordersLoading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No hay pedidos aún</div>
            ) : orders.map((order) => (
              <div key={order._id} className="bg-card rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-card-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("es-CO")}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{order.customerName} — {order.customerPhone}</p>
                {order.customerEmail && <p className="text-sm text-muted-foreground">{order.customerEmail}</p>}
                <div className="mt-2 space-y-0.5">
                  {order.items?.map((item: any, idx: number) => (
                    <p key={idx} className="text-sm">{item.quantity}x {item.name} — {formatPrice(item.price * item.quantity)}</p>
                  ))}
                </div>
                <p className="font-bold mt-2">Total: {formatPrice(order.total)}</p>
                {order.customerNotes && <p className="text-sm text-muted-foreground mt-1">Nota: {order.customerNotes}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {["confirmed", "preparing", "delivered", "cancelled"].map((s) => (
                    order.status !== s && (
                      <button key={s} onClick={() => handleOrderStatus(order._id, s)}
                        className="text-xs px-3 py-1 border border-border rounded-full hover:bg-accent transition">
                        → {STATUS_LABELS[s]}
                      </button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;