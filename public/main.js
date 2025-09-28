"use strict";

//hasta que no cargue no mostramos proveedores existentes
document.addEventListener("DOMContentLoaded", () => {
  cargarProveedores();
});

//devuelve los proveedores cargados
function cargarProveedores() {
  fetch('/api/proveedores')
    .then(res => res.json())
    .then(proveedores => {
      const select = document.getElementById("proveedorSelect");
      select.innerHTML = ""; // limpiamos por si acaso

      if (proveedores.length === 0) {
        const option = document.createElement("option");
        option.text = "No hay proveedores aún";
        select.appendChild(option);
        return;
      }

      proveedores.forEach(nombre => {
        const option = document.createElement("option");
        option.value = nombre;
        option.text = nombre;
        select.appendChild(option);
      });
    })
    .catch(err => console.error(err));
}


function crearProveedor() {
  const nombre = document.getElementById('nombreProveedor').value;
  if (!nombre) {
    alert("Ingrese un nombre de proveedor");
    return;
  }

  fetch('/api/proveedores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
    document.getElementById('nombreProveedor').value = "";
  })
  .catch(err => console.error(err));
}

document.getElementById("pedidoForm").addEventListener("submit", async e => {
      e.preventDefault();
      const pedido = {
        proveedor: document.getElementById("proveedor").value,
        producto: document.getElementById("producto").value,
        cantidad: document.getElementById("cantidad").value
      };

      const res = await fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });

      const data = await res.json();
      document.getElementById("mensaje").textContent = data.message;

      e.target.reset();

      cargarPedidos();//refrescar tabla despues de guardar
    });

    cargarPedidos();//cargar pedidos al iniciar o refresar

    async function cargarPedidos() {
    const res = await fetch("http://localhost:3000/api/pedidos");
    const pedidos = await res.json();

    const tbody = document.querySelector("#tablaPedidos tbody");
    tbody.innerHTML = ""; // limpiar antes de volver a pintar

    pedidos.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
        <td>${p.proveedor}</td>
        <td>${p.producto}</td>
        <td>${p.cantidad}</td>
        `;
        tbody.appendChild(fila);
    });
    }