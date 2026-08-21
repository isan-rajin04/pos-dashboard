import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const additionalSpareparts = [
  // Pengereman
  { name: "Kampas Rem Depan Yamaha Genuine", price: 58000, stock: 40, category: "Pengereman" },
  { name: "Kampas Rem Depan Bendix", price: 62000, stock: 35, category: "Pengereman" },
  
  // Mesin
  { name: "Busi Denso Iridium U24", price: 85000, stock: 50, category: "Mesin" },
  { name: "Filter Udara Ferrox Vario", price: 410000, stock: 32, category: "Mesin" },

  // Pelumas
  { name: "Oli Mesin Motul 3100 10W-40", price: 65000, stock: 45, category: "Pelumas" },
  { name: "Oli Mesin Enduro Racing 4T", price: 50000, stock: 55, category: "Pelumas" },
  
  // Drivetrain
  { name: "Rantai DID 428H-130L", price: 165000, stock: 32, category: "Drivetrain" },
  { name: "Rantai TK Racing 428", price: 195000, stock: 35, category: "Drivetrain" },

  // Roda & Ban
  { name: "Ban Luar Michelin City Grip 90/90-14", price: 315000, stock: 30, category: "Roda & Ban" },
  { name: "Ban Luar Maxxis Diamond 90/90-14", price: 225000, stock: 35, category: "Roda & Ban" },

  // Transmisi
  { name: "Roller CVT BRT 12g", price: 95000, stock: 40, category: "Transmisi" },
  { name: "Kampas Ganda TDR Vario", price: 350000, stock: 32, category: "Transmisi" },

  // Kelistrikan
  { name: "Aki GS Astra MF GTZ5S", price: 220000, stock: 35, category: "Kelistrikan" },
  { name: "Lampu LED RTD 6 Sisi", price: 75000, stock: 42, category: "Kelistrikan" },
];

async function main() {
  console.log("Menambahkan data sparepart tambahan untuk menyeimbangkan grafik...");
  
  for (const item of additionalSpareparts) {
    const product = await prisma.product.create({
      data: item,
    });
    console.log(`Berhasil menambahkan: ${product.name}`);
  }
  
  console.log("Seeding data tambahan selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
