import { expect, test, describe } from "bun:test";
import { app } from "../index";

describe("API Integration Tests", () => {
  test("GET /api/products should return a valid response format", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/products")
    );
    
    // We expect 200 OK or 500 if DB is not connected
    // This test ensures the route is registered and returns JSON
    const data: any = await response.json();
    
    expect(response.headers.get("content-type")).toContain("application/json");
    
    if (response.status === 200) {
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    } else {
      // If DB is not running, it gracefully returns 500 or success=false
      expect(data.success).toBe(false);
    }
  });

  test("POST /api/products should validate body schema", async () => {
    // Missing required fields
    const response = await app.handle(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Incomplete Product"
        })
      })
    );
    
    // Elysia t.Object validation should reject this with 422 Unprocessable Entity
    expect(response.status).toBe(422);
  });
});
