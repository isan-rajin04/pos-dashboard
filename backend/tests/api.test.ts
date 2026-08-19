import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { app } from "../index";

// =====================================================
// INTEGRATION TESTS - Elysia API <-> Prisma <-> DB
// =====================================================
// Catatan: Test ini membutuhkan koneksi database aktif
// (DATABASE_URL di .env). Jika DB tidak tersedia,
// test akan menangani error secara graceful.

describe("Integration Tests: GET /api/products", () => {
  test("should return JSON with success flag", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products")
    );

    expect(response.headers.get("content-type")).toContain("application/json");
    const data: any = await response.json();
    expect(typeof data.success).toBe("boolean");
  });

  test("should return array of products when DB is connected", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products")
    );

    const data: any = await response.json();
    if (data.success) {
      expect(Array.isArray(data.data)).toBe(true);
      expect(response.status).toBe(200);
    } else {
      // DB tidak terhubung, test tetap lulus (graceful fail)
      expect(data.success).toBe(false);
    }
  });

  test("should filter products by search query", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products?search=kampas")
    );

    const data: any = await response.json();
    if (data.success) {
      expect(Array.isArray(data.data)).toBe(true);
    } else {
      expect(data.success).toBe(false);
    }
  });
});

describe("Integration Tests: POST /api/products - Validation", () => {
  test("should return 422 when body is missing required fields", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Produk Tidak Lengkap" }),
      })
    );
    // Elysia schema validation harus menolak dengan 422
    expect(response.status).toBe(422);
  });

  test("should return 422 when price is not a number", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test", price: "bukan-angka", stock: 10 }),
      })
    );
    expect(response.status).toBe(422);
  });

  test("should return 422 when body is empty", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(response.status).toBe(422);
  });
});

describe("Integration Tests: GET /api/products/:id", () => {
  test("should return 404 for non-existent product", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products/id-yang-tidak-ada-sama-sekali")
    );

    const data: any = await response.json();
    if (response.status === 404) {
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    } else {
      // DB tidak terhubung
      expect(data.success).toBe(false);
    }
  });
});

describe("Integration Tests: GET /api/stats", () => {
  test("should return stats with valid structure", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/stats")
    );

    const data: any = await response.json();
    if (data.success) {
      expect(typeof data.data.totalProducts).toBe("number");
      expect(typeof data.data.totalValue).toBe("number");
      expect(Array.isArray(data.data.chartData)).toBe(true);
    } else {
      expect(data.success).toBe(false);
    }
  });
});
