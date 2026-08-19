import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

export const app = new Elysia();
const prisma = new PrismaClient();

app.use(cors());

// Get all products (with optional search)
app.get("/api/products", async ({ query }) => {
  try {
    const { search } = query;
    const products = await prisma.product.findMany({
      where: search ? {
        name: {
          contains: search as string,
        }
      } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
});

// Get stats
app.get("/api/stats", async () => {
  try {
    const products = await prisma.product.findMany();
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    const totalProducts = products.length;
    
    // Group by category for charts
    const categoryData: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || "Uncategorized";
      categoryData[cat] = (categoryData[cat] || 0) + (p.price * p.stock);
    });

    const chartData = Object.keys(categoryData).map(key => ({
      name: key,
      value: categoryData[key]
    }));

    return { 
      success: true, 
      data: {
        totalValue,
        totalProducts,
        chartData
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch stats" };
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