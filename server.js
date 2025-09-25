"use strict"

const express = require("express");
const bodyParser = require("body-parser");
const ExcelJS = require("exceljs");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = "./pedidos.xlsx";

// endpoint para agregar pedido
app.post("/api/pedidos", async (req, res) => {
  const { proveedor, producto, cantidad } = req.body;

  let workbook;
  if (fs.existsSync(FILE_PATH)) {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(FILE_PATH);
  } else {
    workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Pedidos");
    ws.addRow(["Proveedor", "Producto", "Cantidad"]); // encabezados
  }

  const sheet = workbook.getWorksheet("Pedidos");
  sheet.addRow([proveedor, producto, cantidad]);

  await workbook.xlsx.writeFile(FILE_PATH);
  res.json({ message: "✅ Pedido guardado en Excel" });
});

//endpoint para listar pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    if (!fs.existsSync(FILE_PATH)) {
      return res.json([]); // si no existe devolvemos array vacío
    }

    await workbook.xlsx.readFile(FILE_PATH);
    const sheet = workbook.getWorksheet("Pedidos");

    // Convertir filas en objetos JSON
    const pedidos = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // salteamos encabezado
      pedidos.push({
        proveedor: row.getCell(1).value,
        producto: row.getCell(2).value,
        cantidad: row.getCell(3).value
      });
    });

    res.json(pedidos);
  } catch (err) {
    console.error("Error leyendo Excel:", err);
    res.status(500).json({ error: "No se pudo leer el archivo" });
  }
});


app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
