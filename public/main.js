"use strict";


const selectProveedores = document.getElementById("proveedorSelect");
const eliminarProveedor = document.getElementById("eliminarProveedor");

//EVENTOS

//hasta que no cargue no se muestran los proveedores existentes
document.addEventListener("DOMContentLoaded", () => {
  cargarProveedores();
});

//cada vez que cambia el select se muestra el pedido del proveedor
selectProveedores.addEventListener("change", () => {
  const proveedor = selectProveedores.value;
  if (proveedor) {
    cargarPedidos(proveedor);
  }
});

//eliminar proveedor
eliminarProveedor.addEventListener("click", () => {
  eliminarProv(selectProveedores.value);
});

//FORMULARIO

//registro de datos creados por formulario
document.getElementById("pedidoForm").addEventListener("submit", async e => {
  e.preventDefault();
  const pedido = {
    proveedor: document.getElementById("proveedorSelect").value,
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

  cargarPedidos(pedido.proveedor);//refrescar tabla despues de guardar

});

//FUNCIONES

//devuelve proveedores existentes
async function cargarProveedores() {
  try {
    const res = await fetch("/api/proveedores");
    const proveedores = await res.json();

    selectProveedores.innerHTML = "";

    proveedores.forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      selectProveedores.appendChild(option);
    });

    //cargar pedidos del primer proveedor apenas se llena el select
    if (proveedores.length > 0) {
      cargarPedidos(proveedores[0]);
    }
  } catch (err) {
    console.error("Error cargando proveedores:", err);
  }
}

//crear proveedor
function crearProveedor() {
  const nombre = document.getElementById('nombreProveedor').value;
  if (!nombre) {
    alert("Ingrese el nombre del proveedor");
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
  cargarProveedores();//refrescar para ver el nuevo proveedor incluido
}

//mostrar pedidos segun provedor seleccionado
async function cargarPedidos(proveedor) {
  try {
    const res = await fetch(`http://localhost:3000/api/pedidos/${proveedor}`);
    const pedidos = await res.json();

    const tbody = document.querySelector("#tablaPedidos tbody");
    tbody.innerHTML = ""; // limpiar antes de volver a pintar

    pedidos.forEach((p, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.proveedor}</td>
        <td>${p.producto}</td>
        <td>${p.cantidad}</td>
        <td><button class="btn btn-danger">eliminar</button></td>
        `;
      const btn = fila.querySelector(".btn");
      btn.addEventListener("click", () => {
        eliminarRegistro(proveedor, index);
      });

      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error("error cargando pedidos", err);
  }


}

//elimina registro (celda de hoja)
async function eliminarRegistro(proveedor, index) {

  if (!confirm("¿seguro que desea eliminar este registro?")) return;

  await fetch(`api/pedidos/${proveedor}/${index}`, { method: "DELETE" });

  cargarPedidos(proveedor);//actualizar el pedido

}

//elimina proveedor (hoja completa)
async function eliminarProv(proveedor) {
  if (!confirm("¿esta seguro que desea eliminar el proveedor?")) return;

  await fetch(`api/proveedores/${proveedor}`, { method: "DELETE" });

  cargarProveedores();//actualizar los proveedores
}