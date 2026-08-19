import { expect, test, describe } from "bun:test";
import { isValidPrice, isValidStock } from "../utils/validation";

// =====================================================
// UNIT TESTS - Fungsi Utilitas & Logika Bisnis
// =====================================================

describe("Unit Tests: Validasi Harga (isValidPrice)", () => {
  test("harga 0 harus valid (produk gratis diperbolehkan)", () => {
    expect(isValidPrice(0)).toBe(true);
  });

  test("harga positif harus valid", () => {
    expect(isValidPrice(100)).toBe(true);
    expect(isValidPrice(50000)).toBe(true);
    expect(isValidPrice(9999999)).toBe(true);
  });

  test("harga negatif TIDAK valid", () => {
    expect(isValidPrice(-1)).toBe(false);
    expect(isValidPrice(-100)).toBe(false);
    expect(isValidPrice(-0.01)).toBe(false);
  });
});

describe("Unit Tests: Validasi Stok (isValidStock)", () => {
  test("stok 0 harus valid (habis stok masih valid)", () => {
    expect(isValidStock(0)).toBe(true);
  });

  test("stok integer positif harus valid", () => {
    expect(isValidStock(1)).toBe(true);
    expect(isValidStock(50)).toBe(true);
    expect(isValidStock(1000)).toBe(true);
  });

  test("stok negatif TIDAK valid", () => {
    expect(isValidStock(-1)).toBe(false);
    expect(isValidStock(-100)).toBe(false);
  });

  test("stok desimal/float TIDAK valid (stok harus bilangan bulat)", () => {
    expect(isValidStock(1.5)).toBe(false);
    expect(isValidStock(0.1)).toBe(false);
    expect(isValidStock(99.9)).toBe(false);
  });
});

describe("Unit Tests: Kalkulasi Total Nilai Inventaris", () => {
  const calculateInventoryValue = (price: number, stock: number) => price * stock;

  test("kalkulasi nilai inventaris harus benar", () => {
    expect(calculateInventoryValue(55000, 45)).toBe(2475000);
    expect(calculateInventoryValue(18000, 120)).toBe(2160000);
    expect(calculateInventoryValue(215000, 30)).toBe(6450000);
  });

  test("nilai inventaris produk habis stok = 0", () => {
    expect(calculateInventoryValue(100000, 0)).toBe(0);
  });

  test("nilai inventaris tidak boleh negatif", () => {
    const result = calculateInventoryValue(100000, 10);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
