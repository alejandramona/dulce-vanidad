# 🚀 Cómo arrancar local

## Primera vez (solo una vez)

### 1. Edita el .env del backend
Abre `backend/.env` y reemplaza la línea `MONGO_URI` con tu URI real de MongoDB Atlas.

### 2. Instala dependencias

**Terminal 1 — backend:**
```
cd backend
npm install
```

**Terminal 2 — frontend:**
```
cd frontend
npm install
```

---

## Arrancar (cada vez que quieras probar)

**Terminal 1 — backend:**
```
cd backend
npm run dev
```
Debes ver:
```
🚀 Servidor corriendo en puerto 5000
✅ MongoDB conectado: cluster0.xxxxx.mongodb.net
```

**Terminal 2 — frontend:**
```
cd frontend
npm run dev
```
Abre: http://localhost:8080

---

## Crear tu admin (solo una vez)

Con los dos servidores corriendo, abre http://localhost:8080, abre la consola (F12) y ejecuta:

```js
fetch("http://localhost:5000/api/auth/setup", {
  method: "POST",
  headers: {"Content-Type":"application/json"},
  body: JSON.stringify({username:"admin", password:"tu_password"})
}).then(r=>r.json()).then(console.log)
```

Luego entra a http://localhost:8080/admin con ese usuario y contraseña.

---

## Qué cambió vs la versión anterior

| Antes | Ahora |
|-------|-------|
| Productos en localStorage | Productos en MongoDB |
| Admin con contraseña hardcodeada `admin123` | Admin con JWT real |
| Pedidos en localStorage | Pedidos en MongoDB |
| Tienda y admin no se comunicaban | Totalmente integrados |
| Al crear producto en admin, solo aparecía en esa sesión | Aparece para todos los visitantes |

