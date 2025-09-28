"use strict"

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const xlsx = require("xlsx");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const excelFilePath = path.join(__dirname, "pedidos.xlsx");

//obtener los proveedores disponibles
app.get('/api/proveedores', (req, res) => {
  try {
    if (!fs.existsSync(excelFilePath)) {
      return res.json([]); // si no hay archivo todavía, lista vacía
    }
    const workbook = xlsx.readFile(excelFilePath);
    // Devolvemos todos los nombres de hojas
    res.json(workbook.SheetNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar proveedores' });
  }
});

//crear proveedores
app.post('/api/proveedores', (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });
  }

  try {
    // Leer archivo existente o crear uno nuevo
    let workbook;
    if (fs.existsSync(excelFilePath)) {
      workbook = xlsx.readFile(excelFilePath);
    } else {
      workbook = xlsx.utils.book_new();
    }

    // Revisar si ya existe la hoja
    if (workbook.SheetNames.includes(nombre)) {
      return res.status(400).json({ error: 'Ese proveedor ya existe' });
    }

    // Crear hoja vacía con headers
    const data = [["Producto", "Cantidad"]];
    const newSheet = xlsx.utils.aoa_to_sheet(data);

    // Añadir hoja al workbook
    xlsx.utils.book_append_sheet(workbook, newSheet, nombre);

    // Guardar cambios
    xlsx.writeFile(workbook, excelFilePath);

    res.json({ message: `Proveedor "${nombre}" creado correctamente` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});


// endpoint para agregar pedido
app.post("/api/pedidos", (req, res) => {
  const { proveedor, producto, cantidad } = req.body;
  if (!proveedor || !producto || !cantidad)
    return res.status(400).json({ error: "Datos incompletos" });

  if (!fs.existsSync(excelFilePath))
    return res.status(400).json({ error: "No existe archivo Excel" });

  const workbook = xlsx.readFile(excelFilePath);
  if (!workbook.SheetNames.includes(proveedor))
    return res.status(400).json({ error: "Proveedor no existe" });

  const sheet = workbook.Sheets[proveedor];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  rows.push([producto, cantidad]);
  const newSheet = xlsx.utils.aoa_to_sheet(rows);
  workbook.Sheets[proveedor] = newSheet;

  xlsx.writeFile(workbook, excelFilePath);
  res.json({ message: "Pedido agregado correctamente" });
});

//endpoint para listar pedidos
app.get("/api/pedidos", (req, res) => {
  if (!fs.existsSync(excelFilePath)) return res.json([]);

  const workbook = xlsx.readFile(excelFilePath);
  const pedidos = [];

  workbook.SheetNames.forEach((proveedor) => {
    const sheet = workbook.Sheets[proveedor];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    rows.slice(1).forEach((row) => {
      pedidos.push({
        proveedor,
        producto: row[0],
        cantidad: row[1],
      });
    });
  });

  res.json(pedidos);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
