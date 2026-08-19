import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const app = new Elysia();

app.use(cors());

// Get all products
app.get("/api/products", async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
});

// Get single product
app.get("/api/products/:id", async ({ params: { id }, set }) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      set.status = 404;
      return { success: false, error: "Product not found" };
    }
    return { success: true, data: product };
  } catch (error) {
    set.status = 500;
    return { success: false, error: "Failed to fetch product" };
  }
});

// Create product
app.post("/api/products", async ({ body, set }) => {
  try {
    const product = await prisma.product.create({
      data: body,
    });
    set.status = 201;
    return { success: true, data: product };
  } catch (error: any) {
    set.status = 400;
    return { success: false, error: "Failed to create product", details: error.message };
  }
}, {
  body: t.Object({
    name: t.String(),
    price: t.Numeric(),
    stock: t.Numeric(),
    category: t.Optional(t.String()),
  })
});

// Update product
app.put("/api/products/:id", async ({ params: { id }, body, set }) => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: body,
    });
    return { success: true, data: product };
  } catch (error) {
    set.status = 400;
    return { success: false, error: "Failed to update product" };
  }
}, {
  body: t.Object({
    name: t.Optional(t.String()),
    price: t.Optional(t.Numeric()),
    stock: t.Optional(t.Numeric()),
    category: t.Optional(t.String()),
  })
});

// Delete product
app.delete("/api/products/:id", async ({ params: { id }, set }) => {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return { success: true, message: "Product deleted" };
  } catch (error) {
    set.status = 400;
    return { success: false, error: "Failed to delete product" };
  }
});

app.listen(3000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);