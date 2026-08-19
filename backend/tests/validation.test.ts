import { expect, test, describe } from "bun:test";
import { isValidPrice, isValidStock } from "../utils/validation";

describe("Validation Utilities", () => {
  test("isValidPrice should return true for positive numbers", () => {
    expect(isValidPrice(100)).toBe(true);
    expect(isValidPrice(0)).toBe(true);
  });

  test("isValidPrice should return false for negative numbers", () => {
    expect(isValidPrice(-10)).toBe(false);
  });

  test("isValidStock should return true for positive integers", () => {
    expect(isValidStock(50)).toBe(true);
    expect(isValidStock(0)).toBe(true);
  });

  test("isValidStock should return false for negative numbers or floats", () => {
    expect(isValidStock(-5)).toBe(false);
    expect(isValidStock(5.5)).toBe(false);
  });
});
