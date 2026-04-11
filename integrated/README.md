# 🍬 Dulce Vanidad — Monorepo

```
dulce-vanidad/
├── frontend/    → React + Vite + Tailwind  →  Vercel (gratis)
└── backend/     → Node + Express           →  Render (gratis)
                   + MongoDB Atlas           →  Atlas M0 (gratis)
```

---

## 🗂️ Paso 1 — Subir a GitHub

```bash
# Descomprime el zip, entra a la carpeta monorepo/
cd monorepo

git init
git add .
git commit -m "🍬 init dulce vanidad"
```

Ve a [github.com/new](https://github.com/new), crea un repo llamado `dulce-vanidad` y luego:

```bash
git remote add origin https://github.com/TU_USUARIO/dulce-vanidad.git
git branch -M main
git push -u origin main
```

---

## 🍃 Paso 2 — MongoDB Atlas (base de datos gratis)

1. Crea cuenta en [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create a cluster** → elige **M0 Free** (512 MB, suficiente para ~1000 productos)
3. **Database Access** → Add user → pon usuario y contraseña → guárdalos
4. **Network Access** → Add IP → escribe `0.0.0.0/0` → Confirm
5. **Connect** → Drivers → copia la URI, reemplaza `<password>`:
   ```
   mongodb+srv://usuario:TU_PASSWORD@cluster0.xxxxx.mongodb.net/dulce-vanidad?retryWrites=true&w=majority
   ```
   Guarda este string, lo necesitas en el siguiente paso.

---

## ⚙️ Paso 3 — Backend en Render (gratis)

1. Ve a [render.com](https://render.com) → **New Web Service**
2. Conecta tu cuenta de GitHub → selecciona el repo `dulce-vanidad`
3. Configura:
   - **Name:** `dulce-vanidad-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. En **Environment Variables** agrega:

   | Variable | Valor |
   |----------|-------|
   | `MONGO_URI` | tu URI de Atlas del paso 2 |
   | `JWT_SECRET` | cualquier texto largo (ej: `mi_secreto_super_seguro_2024`) |
   | `FRONTEND_URL` | lo llenas después con la URL de Vercel |
   | `NODE_ENV` | `production` |

5. Click **Create Web Service** → espera ~3 minutos
6. Render te dará una URL: `https://dulce-vanidad-api.onrender.com`  
   **Guárdala**, la necesitas en el paso 4.

> ⚠️ En el plan gratis, Render duerme el servidor tras 15 min sin tráfico.  
> El primer request del día tarda ~30 seg. Para la tienda está bien.

---

## 🌐 Paso 4 — Frontend en Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repo `dulce-vanidad` de GitHub
3. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta automático)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. En **Environment Variables** agrega:

   | Variable | Valor |
   |----------|-------|
   | `VITE_API_URL` | `https://dulce-vanidad-api.onrender.com/api` |

5. Click **Deploy** → Vercel construye y publica
6. Te dará una URL: `https://dulce-vanidad.vercel.app`

---

## 🔗 Paso 5 — Conectar frontend ↔ backend

Ahora que tienes la URL de Vercel, vuelve a Render:

1. Render → tu servicio → **Environment**
2. Edita `FRONTEND_URL` → pon: `https://dulce-vanidad.vercel.app`
3. Render redesplegará automáticamente (1-2 min)

---

## 🔐 Paso 6 — Crear tu usuario admin (solo una vez)

Abre cualquier cliente HTTP (Postman, Insomnia, o simplemente el navegador/curl):

```bash
curl -X POST https://dulce-vanidad-api.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_password_seguro"}'
```

O con fetch desde la consola del navegador:
```js
fetch("https://dulce-vanidad-api.onrender.com/api/auth/setup", {
  method: "POST",
  headers: {"Content-Type":"application/json"},
  body: JSON.stringify({username:"admin", password:"tu_password"})
}).then(r=>r.json()).then(console.log)
```

Guarda el token que devuelve. Después usa `/api/auth/login` para los siguientes logins.

---

## ✅ Resumen de URLs finales

| Servicio | URL |
|----------|-----|
| 🛍️ Tienda | `https://dulce-vanidad.vercel.app` |
| ⚙️ Admin | `https://dulce-vanidad.vercel.app/admin` |
| 🔌 API | `https://dulce-vanidad-api.onrender.com/api` |
| 💚 Health | `https://dulce-vanidad-api.onrender.com/api/health` |

---

## 💡 Desarrollo local

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env   # edita con tus datos
npm install
npm run dev            # corre en localhost:5000

# Terminal 2 — frontend
cd frontend
cp .env.example .env.local   # edita VITE_API_URL=http://localhost:5000/api
npm install
npm run dev            # corre en localhost:8080
```
