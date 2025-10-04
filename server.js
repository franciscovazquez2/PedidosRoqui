"use strict"

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const xlsx = require("xlsx");
const { ClientRequest } = require("http");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const excelFilePath = path.join(__dirname, "pedidos.xlsx");
const exelFilePathAvisos = path.join(__dirname, "avisos.xlsx");
//METODOS CRUD

//GET

//obtener los proveedores disponibles
app.get('/api/proveedores', (req, res) => {
  try {
    if (!fs.existsSync(excelFilePath)) {
      return res.json([]); // si no hay archivo todavía, lista vacía
    }
    const workbook = xlsx.readFile(excelFilePath);
    res.json(workbook.SheetNames);// Devuelve todos los nombres de hojas
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar proveedores' });
  }
});

//obtener pedidos por proveedor
app.get("/api/pedidos/:proveedor", (req, res) => {
  try {
    const { proveedor } = req.params;
    if (!fs.existsSync(excelFilePath)) return res.json([]);//devolver vacio si no existen hojas
    const workbook = xlsx.readFile(excelFilePath);
    const pedidos = [];
    const sheet = workbook.Sheets[proveedor];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    rows.slice(1).forEach((row) => {
      pedidos.push({
        proveedor,
        producto: row[0],
        codigo: row[1],
      });
    });
    res.json(pedidos);
  } catch (err) {
    console.error("error leyendo exel:", err);
    res.status(500).json({ error: "no se pudo leer el archivo" });
  }
});

//obtener avisos cargados
app.get("/api/avisos",(req,res)=>{
  try {
    if (!fs.existsSync(exelFilePathAvisos)) return res.json([]);//devolver vacio si no existen hojas
    const workbook = xlsx.readFile(exelFilePathAvisos);
    const avisos = [];
    const sheet = workbook.Sheets["avisos"];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    rows.slice(1).forEach((row,i) => {
      avisos.push({
        index: i,
        producto: row[0],
        codigo: row[1],
        nombreCliente: row[2],
        telefono: row[3],
        estado:row[4] || "pendiente"
      });
    });
    res.json(avisos);
  } catch (err) {
    console.error("error leyendo exel:", err);
    res.status(500).json({ error: "no se pudo leer el archivo" });
  }
});

//POST

//crear proveedor
app.post('/api/proveedores', (req, res) => {
  const { nombre } = req.body;

  if (!nombre) { return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' }); }

  try {
    // Leer archivo existente o crear uno nuevo
    let workbook;
    if (fs.existsSync(excelFilePath)) {
      workbook = xlsx.readFile(excelFilePath);
    } else {
      workbook = xlsx.utils.book_new();
    }
    // Revisar si ya existe la hoja
    if (workbook.SheetNames.includes(nombre)) { return res.status(400).json({ error: 'Ese proveedor ya existe' }); }

    // Crear hoja vacía con headers
    const data = [["Producto", "Codigo"]];
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


//crear/agregar a pedido
app.post("/api/pedidos", (req, res) => {
  const { proveedor, producto, codigo } = req.body;
  if (!proveedor || !producto || !codigo)
    return res.status(400).json({ error: "Datos incompletos" });

  if (!fs.existsSync(excelFilePath))
    return res.status(400).json({ error: "No existe archivo Excel" });

  const workbook = xlsx.readFile(excelFilePath);
  if (!workbook.SheetNames.includes(proveedor))
    return res.status(400).json({ error: "Proveedor no existe" });

  const sheet = workbook.Sheets[proveedor];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  rows.push([producto, codigo]);
  const newSheet = xlsx.utils.aoa_to_sheet(rows);
  workbook.Sheets[proveedor] = newSheet;

  xlsx.writeFile(workbook, excelFilePath);
  res.json({ message: "producto agregado correctamente" });
});

//crear aviso
app.post("/api/avisos", (req, res) => {
  const { producto, codigo, nombreCliente, telefono } = req.body;

  if (!producto || !codigo || !nombreCliente || !telefono)
    return res.status(400).json({ error: "Datos incompletos" });

  try {
    let workbook;
    if (fs.existsSync(exelFilePathAvisos)) {
      workbook = xlsx.readFile(exelFilePathAvisos);
    } else {
      workbook = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet([["Producto", "Codigo", "Cliente", "Telefono", "Estado"]]);
      xlsx.utils.book_append_sheet(workbook, ws, "avisos");
    }

    const sheet = workbook.Sheets["avisos"];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    rows.push([producto, codigo, nombreCliente, telefono, "pendiente"]);

    const newSheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets["avisos"] = newSheet;

    xlsx.writeFile(workbook, exelFilePathAvisos);

    res.json({ message: "Aviso agregado correctamente" });
  }catch(err){
    console.log("Error guardando avisos", err);
    return res.status(500).json({error:"No se pudo guardar el aviso"});
  }

});


//DELETE

// eliminar una registro por índice
app.delete("/api/pedidos/:proveedor/:index", (req, res) => {
  try {
    const { proveedor, index } = req.params;
    if (!fs.existsSync(excelFilePath)) return res.status(404).json({ error: "Archivo no encontrado" });

    const workbook = xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[proveedor];
    if (!sheet) return res.status(404).json({ error: "Proveedor no encontrado" });

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Mantener cabecera y eliminar fila
    const header = rows[0];
    rows.splice(parseInt(index) + 1, 1); // +1 porque rows[0] es header

    const newSheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets[proveedor] = newSheet;

    xlsx.writeFile(workbook, excelFilePath);

    res.json({ message: "Pedido eliminado" });
  } catch (err) {
    console.error("Error eliminando pedido:", err);
    res.status(500).json({ error: "No se pudo eliminar el pedido" });
  }
});

// eliminar un proveedor (hoja completa)
app.delete("/api/proveedores/:proveedor", (req, res) => {
  try {
    const { proveedor } = req.params;
    if (!fs.existsSync(excelFilePath)) return res.status(404).json({ error: "Archivo no encontrado" });

    const workbook = xlsx.readFile(excelFilePath);

    if (!workbook.Sheets[proveedor]) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Borrar hoja
    delete workbook.Sheets[proveedor];
    workbook.SheetNames = workbook.SheetNames.filter(name => name !== proveedor);

    xlsx.writeFile(workbook, excelFilePath);

    res.json({ message: "Proveedor eliminado" });
  } catch (err) {
    console.error("Error eliminando proveedor:", err);
    res.status(500).json({ error: "No se pudo eliminar el proveedor" });
  }
});

// Eliminar aviso por índice
app.delete("/api/avisos/:index", (req, res) => {
  try {
    const { index } = req.params;
    if (!fs.existsSync(exelFilePathAvisos))
      return res.status(404).json({ error: "Archivo no encontrado" });

    const workbook = xlsx.readFile(exelFilePathAvisos);
    const sheet = workbook.Sheets["avisos"];
    if (!sheet) return res.status(404).json({ error: "Hoja 'avisos' no encontrada" });

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (rows.length <= 1) return res.status(400).json({ error: "No hay registros" });

    // Mantener cabecera y eliminar fila
    rows.splice(parseInt(index) + 1, 1);

    const newSheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets["avisos"] = newSheet;

    xlsx.writeFile(workbook, exelFilePathAvisos);
    res.json({ message: "Aviso eliminado" });
  } catch (err) {
    console.error("Error eliminando aviso:", err);
    res.status(500).json({ error: "No se pudo eliminar el aviso" });
  }
});

// Marcar aviso como "Avisado"
app.put("/api/avisos/:index", (req, res) => {
  try {
    const { index } = req.params;
    if (!fs.existsSync(exelFilePathAvisos))
      return res.status(404).json({ error: "Archivo no encontrado" });

    const workbook = xlsx.readFile(exelFilePathAvisos);
    const sheet = workbook.Sheets["avisos"];
    if (!sheet) return res.status(404).json({ error: "Hoja 'avisos' no encontrada" });

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows[parseInt(index) + 1]) return res.status(404).json({ error: "Aviso no encontrado" });

    // Cambiar columna estado (posición 4)
    rows[parseInt(index) + 1][4] = "Avisado";

    const newSheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets["avisos"] = newSheet;

    xlsx.writeFile(workbook, exelFilePathAvisos);
    res.json({ message: "Aviso actualizado" });
  } catch (err) {
    console.error("Error actualizando aviso:", err);
    res.status(500).json({ error: "No se pudo actualizar el aviso" });
  }
});



app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
