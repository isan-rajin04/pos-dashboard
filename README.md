# 🏍️ NexPOS - POS Dashboard

Dashboard Point of Sales (POS) berbasis web untuk manajemen inventaris sparepart motor, dibangun dengan stack modern.

![Tech Stack](https://img.shields.io/badge/Bun-F9F1E1?style=flat&logo=bun&logoColor=black) ![Elysia](https://img.shields.io/badge/Elysia.js-8B5CF6?style=flat) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

## ✨ Fitur

- **Dashboard Overview** — Statistik total produk, total nilai inventaris, dan grafik per kategori
- **Manajemen Produk (CRUD)** — Tambah, lihat, edit, dan hapus produk
- **Pencarian Real-time** — Filter produk berdasarkan nama secara live
- **Export CSV** — Unduh laporan inventaris dalam format CSV
- **Toast Notifications** — Notifikasi aksi sukses/gagal yang elegan
- **Responsive UI** — Layout modern dengan Sidebar, glassmorphism effect

## 🛠️ Tech Stack

| Bagian | Teknologi |
|---|---|
| **Runtime** | Bun |
| **Backend** | Elysia.js |
| **ORM** | Prisma v6 |
| **Database** | PostgreSQL (Supabase) |
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Testing** | Bun Test Runner |

## 📋 Persyaratan

- [Bun](https://bun.sh/) v1.0+
- Database PostgreSQL (disarankan: [Supabase](https://supabase.com) — gratis)

## 🚀 Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/isan-rajin04/pos-dashboard.git
cd pos-dashboard
```

### 2. Setup Backend

```bash
cd backend
bun install
```

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

> Untuk Supabase: Ambil Connection String dari **Project Settings → Database → Connection Pooling (Transaction Mode)**

Sinkronisasi schema database:

```bash
bunx prisma db push
```

(Opsional) Isi data contoh sparepart motor:

```bash
bun run seed
```

Jalankan server backend (development mode):

```bash
bun run dev
```

Server berjalan di: `http://localhost:3000`

### 3. Setup Frontend

```bash
# Di terminal baru
cd frontend
bun install
bun run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## 🧪 Testing (Pengujian)

Semua pengujian berada di `backend/tests/` menggunakan **Bun Test Runner** (built-in).

```bash
cd backend
bun test
```

### Kategori Test

| File | Tipe | Cakupan |
|---|---|---|
| `tests/validation.test.ts` | **Unit Test** | Validasi harga, stok, kalkulasi nilai inventaris |
| `tests/api.test.ts` | **Integration Test** | Endpoint CRUD API, validasi schema request, penanganan error |

---

## 📖 Dokumentasi API

**Base URL:** `http://localhost:3000`

---

### `GET /api/products`
Mendapatkan seluruh daftar produk. Mendukung pencarian via query parameter.

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `search` | `string` (opsional) | Filter produk berdasarkan nama |

**Contoh Request:**
```
GET /api/products?search=kampas
```

**Contoh Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-produk",
      "name": "Kampas Rem Depan Honda Genuine",
      "price": 55000,
      "stock": 45,
      "category": "Pengereman",
      "createdAt": "2026-08-19T10:00:00.000Z",
      "updatedAt": "2026-08-19T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/products/:id`
Mendapatkan detail satu produk berdasarkan ID.

**Contoh Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-produk",
    "name": "Busi NGK CPR9EA-9",
    "price": 18000,
    "stock": 120,
    "category": "Mesin",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### `POST /api/products`
Menambahkan produk baru.

**Request Body:**
```json
{
  "name": "Filter Udara Vario 150",
  "price": 45000,
  "stock": 40,
  "category": "Mesin"
}
```

| Field | Tipe | Required |
|---|---|---|
| `name` | `string` | ✅ |
| `price` | `number` | ✅ |
| `stock` | `number` | ✅ |
| `category` | `string` | ❌ opsional |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-baru",
    "name": "Filter Udara Vario 150",
    "price": 45000,
    "stock": 40,
    "category": "Mesin",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:00:00.000Z"
  }
}
```

**Response (422 Unprocessable Entity)** — jika field required tidak ada:
```json
{
  "type": "validation",
  "on": "body",
  "message": "..."
}
```

---

### `PUT /api/products/:id`
Memperbarui data produk yang ada. Semua field bersifat opsional.

**Request Body (contoh update stok saja):**
```json
{
  "stock": 100
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-produk",
    "name": "Filter Udara Vario 150",
    "price": 45000,
    "stock": 100,
    "category": "Mesin",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:30:00.000Z"
  }
}
```

---

### `DELETE /api/products/:id`
Menghapus produk berdasarkan ID.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

### `GET /api/stats`
Mendapatkan statistik ringkasan untuk dashboard.

**Contoh Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalProducts": 12,
    "totalValue": 24750000,
    "chartData": [
      { "name": "Pengereman", "value": 2475000 },
      { "name": "Mesin", "value": 4900000 },
      { "name": "Pelumas", "value": 5560000 }
    ]
  }
}
```
