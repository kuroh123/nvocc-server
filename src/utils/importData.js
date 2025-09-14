// import-csv.js
import fs, { stat } from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const records = [];

  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream("./csv_data/country_table.csv") // <-- change file path
      .pipe(csv())
      .on("data", (row) => {
        records.push(row);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Insert into DB using Prisma
  await prisma.country.createMany({
    data: records.map((row) => ({
      name: row.name,
      codeChar2: row.country_code_char2,
      codeChar3: row.country_code_char3,
      unRegion: row.un_region,
      unSubregion: row.un_subregion,
      invoiceRoundOff: row.invoice_round_off,
      status: row.status_id === "1" ? "ACTIVE" : "INACTIVE",
    })),
    skipDuplicates: true, // avoids inserting same email twice
  });

  console.log("CSV import completed!");
}

main()
  .catch((err) => {
    console.error("Error importing CSV:", err);
  })
  .finally(() => prisma.$disconnect());
