# JARI.ECOM V2 - QUICK START

## 🚀 First Time Setup

1. **Get Database URL from Railway**
   - Create new project on railway.app
   - Add PostgreSQL service
   - Copy DATABASE_URL from Variables tab
   - Paste into `api/.env`

2. **Install Dependencies**
   ```
   Double-click: INSTALL.bat
   ```

3. **Run Migrations**
   ```
   Double-click: MIGRATE.bat
   ```

4. **Start Servers** (3 separate terminals)
   ```
   Terminal 1: START-API.bat       → http://localhost:3001
   Terminal 2: START-DASHBOARD.bat → http://localhost:5173
   Terminal 3: START-STORE.bat     → http://localhost:5174
   ```

5. **Test Everything**
   ```
   Double-click: TEST-API.bat
   ```

---

## 📍 URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3001 |
| Dashboard | http://localhost:5173 |
| Store | http://localhost:5174?store=YOUR_SLUG |

---

## 🧪 Test Flow

1. Open Dashboard: http://localhost:5173
2. Register new account
3. Add a product
4. Copy your store slug from Settings
5. View store: http://localhost:5174?store=YOUR_SLUG
6. Test checkout flow

---

## 📁 File Structure

```
jari-ecom-v2/
├── api/           → Backend (Port 3001)
│   ├── .env       → DATABASE_URL, JWT_SECRET
│   └── src/       → Routes, middleware
├── dashboard/     → Admin panel (Port 5173)
│   ├── .env       → VITE_API_URL
│   └── src/       → React pages
├── store/         → Customer store (Port 5174)
│   ├── .env       → VITE_API_URL
│   └── src/       → Vanilla JS
└── shared/        → Templates & themes JSON
```

---

## 🔧 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL in api/.env
- Make sure Railway PostgreSQL is running

### "CORS error"
- Verify CORS_ORIGINS in api/.env includes your frontend URLs

### "Cannot find module"
- Run INSTALL.bat again

### Store shows "Store not found"
- Make sure API is running
- Check the slug parameter: ?store=YOUR_SLUG

---

## 🎯 What's Working

✅ User registration & login (JWT)
✅ Store creation (auto on register)
✅ Product CRUD (with templates)
✅ Order management
✅ Theme selection
✅ Public store view
✅ 5-step checkout flow
