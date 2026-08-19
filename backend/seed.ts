import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const spareparts = [
  { name: "Kampas Rem Depan Honda Genuine", price: 55000, stock: 45, category: "Pengereman" },
  { name: "Busi NGK CPR9EA-9", price: 18000, stock: 120, category: "Mesin" },
  { name: "Oli Mesin Yamalube Sport 10W-40", price: 52000, stock: 60, category: "Pelumas" },
  { name: "Oli Gardan MPX 2", price: 15000, stock: 80, category: "Pelumas" },
  { name: "Rantai SSS 428H-130L", price: 175000, stock: 25, category: "Drivetrain" },
  { name: "Ban Luar IRC 90/90-14 Tubeless", price: 215000, stock: 30, category: "Roda & Ban" },
  { name: "Ban Dalam FDR 17 inch", price: 35000, stock: 50, category: "Roda & Ban" },
  { name: "Filter Udara Vario 150", price: 45000, stock: 40, category: "Mesin" },
  { name: "Roller CVT Kawahara 12g", price: 85000, stock: 35, category: "Transmisi" },
  { name: "Kampas Ganda Daytona Vario", price: 380000, stock: 15, category: "Transmisi" },
  { name: "Aki Motobatt MTZ5S", price: 210000, stock: 20, category: "Kelistrikan" },
  { name: "Lampu LED Osram T19", price: 65000, stock: 40, category: "Kelistrikan" },
];

async function main() {
  console.log("Mulai menambahkan data sparepart...");
  
  for (const item of spareparts) {
    const product = await prisma.product.create({
      data: item,
    });
    console.log(`Berhasil menambahkan: ${product.name}`);
  }
  
  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
