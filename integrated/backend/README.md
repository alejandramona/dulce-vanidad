# 🍬 Dulce Vanidad — Backend API

REST API para la tienda WhatsApp. Node.js + Express + MongoDB Atlas.

---

## 🚀 Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/setup` | No | Crear primer admin (solo una vez) |
| POST | `/api/auth/login` | No | Login → devuelve JWT |
| GET | `/api/auth/me` | ✅ | Verificar token |
| PUT | `/api/auth/password` | ✅ | Cambiar contraseña |

### Productos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | No | Listar productos activos |
| GET | `/api/products/categories` | No | Categorías disponibles |
| GET | `/api/products/:id` | No | Detalle de producto |
| POST | `/api/products` | ✅ | Crear producto |
| PUT | `/api/products/:id` | ✅ | Actualizar producto |
| PATCH | `/api/products/:id/stock` | ✅ | Actualizar stock |
| DELETE | `/api/products/:id` | ✅ | Eliminar producto |

### Órdenes
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/orders` | No | Crear pedido (checkout público) |
| GET | `/api/orders` | ✅ | Listar pedidos |
| GET | `/api/orders/stats` | ✅ | Estadísticas dashboard |
| GET | `/api/orders/:id` | ✅ | Detalle de pedido |
| PATCH | `/api/orders/:id/status` | ✅ | Cambiar estado |
| DELETE | `/api/orders/:id` | ✅ | Eliminar pedido |

---

## ⚙️ Instalación local

```bash
git clone <tu-repo>
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run dev
```

---

## ☁️ Deploy en Render (gratis)

1. Sube el backend a GitHub (repositorio separado del frontend)
2. Ve a [render.com](https://render.com) → **New Web Service**
3. Conecta tu repositorio
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Agrega las variables de entorno (igual que `.env`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
6. Deploy → Render te dará una URL tipo `https://dulce-vanidad-api.onrender.com`

> ⚠️ En el plan gratis, Render "duerme" el servidor tras 15 min de inactividad. El primer request tarda ~30 seg en despertar.

---

## 🍃 MongoDB Atlas (gratis)

1. Crea cuenta en [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea un cluster **M0 Free**
3. En **Database Access**: crea usuario con contraseña
4. En **Network Access**: agrega `0.0.0.0/0` (permitir todas las IPs)
5. En **Connect → Drivers**: copia la URI y pégala en `MONGO_URI`

---

## 🔐 Primer login

Una vez desplegado, llama **una sola vez**:

```http
POST https://tu-api.onrender.com/api/auth/setup
Content-Type: application/json

{
  "username": "admin",
  "password": "tu-password-seguro"
}
```

Guarda el token que devuelve. Después usa `/api/auth/login` para los siguientes logins.

---

## 🌐 Frontend (.env en Vercel)

Agrega esta variable en Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://tu-api.onrender.com/api
```

Y úsala en el frontend así:
```js
const API = import.meta.env.VITE_API_URL;
fetch(`${API}/products`)
```
