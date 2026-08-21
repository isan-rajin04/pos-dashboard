# Gunakan image resmi Bun berbasis Alpine Linux untuk ukuran yang ringan
FROM oven/bun:1 as base
WORKDIR /app

# Copy file dependency terlebih dahulu untuk caching layer
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies dan generate Prisma Client
RUN bun install
RUN bunx prisma generate

# Copy seluruh source code backend
COPY . .

# Expose port yang digunakan oleh Elysia
EXPOSE 3000

# Jalankan server
CMD ["bun", "run", "start"]
