# POS Dashboard

Sebuah Dashboard Point of Sales (POS) sederhana yang dibangun dengan:
- **Backend**: Bun + Elysia.js + Prisma
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS v4
- **Database**: PostgreSQL

## Persyaratan
- Bun terinstal (https://bun.sh/)
- Node.js & npm terinstal
- PostgreSQL berjalan (lokal atau cloud)

## 1. Setup Backend

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal dependensi:
   ```bash
   bun install
   ```
3. Konfigurasi Database:
   Buka file `backend/.env` dan atur `DATABASE_URL` Anda:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/pos_db?schema=public"
   ```
4. Jalankan Migrasi Prisma untuk membuat tabel:
   ```bash
   bunx prisma db push
   # atau `bunx prisma migrate dev`
   ```
5. Generate Prisma Client (opsional jika sudah dijalankan sebelumnya):
   ```bash
   bunx prisma generate
   ```
6. Jalankan server backend (Mode Development):
   ```bash
   bun run dev
   ```
   Backend akan berjalan di `http://localhost:3000`.

## 2. Setup Frontend

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi (bisa menggunakan `bun` atau `npm`):
   ```bash
   bun install
   ```
3. Jalankan server frontend:
   ```bash
   bun run dev
   ```
   Frontend akan berjalan di port default Vite (misalnya `http://localhost:5173`).

## 3. Testing (Pengujian)

Proyek ini dilengkapi dengan Unit Testing dan Integration Testing di sisi Backend menggunakan Bun Test Runner.

Untuk menjalankan pengujian:
```bash
cd backend
bun test
```

## Dokumentasi API (Elysia.js)
Base URL: `http://localhost:3000`

- `GET /api/products` : Mendapatkan seluruh data produk.
- `GET /api/products/:id` : Mendapatkan data produk berdasarkan ID.
- `POST /api/products` : Menambahkan data produk baru.
  - Body: `{ name: String, price: Number, stock: Number, category?: String }`
- `PUT /api/products/:id` : Memperbarui data produk.
  - Body: Opsional field produk yang ingin diubah.
- `DELETE /api/products/:id` : Menghapus data produk.
