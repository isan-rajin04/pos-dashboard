import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

export const app = new Elysia();
const prisma = new PrismaClient();

app.use(cors());

// ──────────────────────────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────────────────────────

app.get("/api/products", async ({ query }) => {
  try {
    const products = await prisma.product.findMany({
      where: query.search ? { name: { contains: query.search as string } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch {
    return { success: false, error: "Failed to fetch products" };
  }
});

app.get("/api/stats", async () => {
  try {
    const products = await prisma.product.findMany();
    const transactions = await prisma.transaction.findMany({
      include: { items: true },
    });

    const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const totalProducts = products.length;

    const categoryData: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      categoryData[cat] = (categoryData[cat] || 0) + p.price * p.stock;
    });
    const chartData = Object.keys(categoryData).map((k) => ({ name: k, value: categoryData[k] }));

    // Revenue per day (last 7 days)
    const now = new Date();
    const revenueByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueByDay[d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })] = 0;
    }
    transactions.forEach((t) => {
      const label = new Date(t.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      if (label in revenueByDay) revenueByDay[label] += t.total;
    });
    const revenueChart = Object.entries(revenueByDay).map(([name, value]) => ({ name, value }));

    const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
    const totalTransactions = transactions.length;

    return { success: true, data: { totalValue, totalProducts, chartData, revenueChart, totalRevenue, totalTransactions } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

app.get("/api/products/:id", async ({ params: { id }, set }) => {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) { set.status = 404; return { success: false, error: "Product not found" }; }
    return { success: true, data: product };
  } catch {
    set.status = 500; return { success: false, error: "Failed to fetch product" };
  }
});

app.post("/api/products", async ({ body, set }) => {
  try {
    const product = await prisma.product.create({ data: body });
    set.status = 201;
    return { success: true, data: product };
  } catch (e: any) {
    set.status = 400; return { success: false, error: "Failed to create product", details: e.message };
  }
}, {
  body: t.Object({
    name: t.String(),
    price: t.Numeric(),
    stock: t.Numeric(),
    category: t.Optional(t.String()),
  }),
});

app.put("/api/products/:id", async ({ params: { id }, body, set }) => {
  try {
    const product = await prisma.product.update({ where: { id }, data: body });
    return { success: true, data: product };
  } catch {
    set.status = 400; return { success: false, error: "Failed to update product" };
  }
}, {
  body: t.Object({
    name: t.Optional(t.String()),
    price: t.Optional(t.Numeric()),
    stock: t.Optional(t.Numeric()),
    category: t.Optional(t.String()),
  }),
});

app.delete("/api/products/:id", async ({ params: { id }, set }) => {
  try {
    await prisma.product.delete({ where: { id } });
    return { success: true, message: "Product deleted" };
  } catch {
    set.status = 400; return { success: false, error: "Failed to delete product" };
  }
});

// ──────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ──────────────────────────────────────────────────────────────────

app.get("/api/transactions", async () => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: transactions };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

app.get("/api/transactions/:id", async ({ params: { id }, set }) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!transaction) { set.status = 404; return { success: false, error: "Transaction not found" }; }
    return { success: true, data: transaction };
  } catch {
    set.status = 500; return { success: false, error: "Failed to fetch transaction" };
  }
});

app.post("/api/transactions", async ({ body, set }) => {
  try {
    const { items, note } = body;

    // Validate stock for all items first
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        set.status = 404;
        return { success: false, error: `Produk dengan ID ${item.productId} tidak ditemukan` };
      }
      if (product.stock < item.quantity) {
        set.status = 400;
        return { success: false, error: `Stok ${product.name} tidak cukup. Stok tersedia: ${product.stock}` };
      }
    }

    // Build transaction items with current product data
    const itemsWithData = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          productId: item.productId,
          productName: product!.name,
          price: product!.price,
          quantity: item.quantity,
          subtotal: product!.price * item.quantity,
        };
      })
    );

    const total = itemsWithData.reduce((acc, i) => acc + i.subtotal, 0);

    // Create transaction and reduce stock in a single Prisma transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          total,
          note: note || null,
          items: { create: itemsWithData },
        },
        include: { items: true },
      });

      // Reduce stock
      for (const item of itemsWithData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    set.status = 201;
    return { success: true, data: transaction };
  } catch (e: any) {
    set.status = 500;
    return { success: false, error: "Gagal membuat transaksi", details: e.message };
  }
}, {
  body: t.Object({
    note: t.Optional(t.String()),
    items: t.Array(t.Object({
      productId: t.String(),
      quantity: t.Numeric(),
    })),
  }),
});

app.delete("/api/transactions/:id", async ({ params: { id }, set }) => {
  try {
    await prisma.transaction.delete({ where: { id } });
    return { success: true, message: "Transaction deleted" };
  } catch {
    set.status = 400; return { success: false, error: "Failed to delete transaction" };
  }
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port);
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
}

export default function (req: Request) {
  return app.fetch(req);
}
export const fetch = app.fetch;