"use strict";

const selectProveedores = document.getElementById("proveedorSelect");
const eliminarProveedorSelect = document.getElementById("eliminarProveedorSelect");
const eliminarProveedor = document.getElementById("eliminarProveedor");
//EVENTOS

//cargar proveedores y avisos en el inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarProveedores();
  cargarAvisos();
});

//mostrar pedido del proveedor al cambiar el select proveedor
selectProveedores.addEventListener("change", () => {
  const proveedor = selectProveedores.value;
  if (proveedor) {
    cargarPedidos(proveedor);
  }
});

//eliminar proveedor
eliminarProveedor.addEventListener("click", () => {
  eliminarProv(eliminarProveedorSelect.value);
});

//FORMULARIOS

//registro de datos creados por formulario productos
document.getElementById("pedidoForm").addEventListener("submit", async e => {
  e.preventDefault();
  const pedido = {
    proveedor: document.getElementById("proveedorSelect").value,
    producto: document.getElementById("producto").value,
    codigo: document.getElementById("codigo").value
  };

  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });

  const data = await res.json();
  document.getElementById("mensaje").textContent = data.message;

  setTimeout(function () {
    document.getElementById("mensaje").textContent = "";
  }, 2000); // Espera 2 segundos y borra el comentario
  
  e.target.reset();

  cargarPedidos(pedido.proveedor);//refrescar tabla despues de guardar

});

//registro de datos creados por formulario avisos
document.getElementById("avisosForm").addEventListener("submit", async e => {
  e.preventDefault();
  const aviso = {
    producto: document.getElementById("productoAviso").value,
    codigo: document.getElementById("codigoAviso").value,
    nombreCliente: document.getElementById("nombreCliente").value,
    telefono: document.getElementById("telefono").value
  };

  const res = await fetch("/api/avisos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aviso)
  });

  const data = await res.json();
  document.getElementById("mensajeAviso").textContent = data.message;

  setTimeout(function () {
    document.getElementById("mensajeAviso").textContent = "";
  }, 2000); // Espera 2 segundos y borra el comentario

  e.target.reset();

  cargarAvisos();//refrescar tabla despues de guardar

});

//FUNCIONES

//devuelve proveedores existentes
async function cargarProveedores() {
  try {
    const res = await fetch("/api/proveedores");
    const proveedores = await res.json();

    selectProveedores.innerHTML = "";
    eliminarProveedorSelect.innerHTML = "";

    proveedores.forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      selectProveedores.appendChild(option);

      const option2 = document.createElement("option");
      option2.value = p;
      option2.textContent = p;
      eliminarProveedorSelect.appendChild(option2);
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
    const res = await fetch(`/api/pedidos/${proveedor}`);
    const pedidos = await res.json();

    const tbody = document.querySelector("#tablaPedidos tbody");
    tbody.innerHTML = ""; // limpiar antes de volver a pintar

    pedidos.forEach((p, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.producto}</td>
        <td>${p.codigo}</td>
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

//devuelve listado de avisos
async function cargarAvisos() {
  try {
    const res = await fetch("/api/avisos");
    const avisos = await res.json();

    const tbody = document.querySelector("#tablaAvisos tbody");
    tbody.innerHTML = "";//limpiar antes de volver a mostrar

    avisos.forEach((a, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
      <td>${a.producto}</td>
      <td>${a.codigo}</td>
      <td>${a.nombreCliente}</td>
      <td>${a.telefono}</td>
      <td class="${a.estado === 'Avisado' ? 'text-success fw-bold' : ''}">
      ${a.estado}
      </td>
      <td>
      <button class="btn btn-success btn-sm me-2">Avisado</button>
      <button class="btn btn-danger btn-sm">Eliminar</button>
      </td>
      `;

      // botón avisado
      fila.querySelector(".btn-success").addEventListener("click", () => {
        marcarAvisado(index);
      });

      // botón eliminar
      fila.querySelector(".btn-danger").addEventListener("click", () => {
        eliminarRegistroAviso(index);
      });

      tbody.appendChild(fila);
    })
  } catch (err) {
    console.log("error al intentar cargar aviso", err);
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

//put
async function marcarAvisado(index) {
  await fetch(`/api/avisos/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: "Avisado" })
  });

  cargarAvisos();
}

//eliminacion de aviso
async function eliminarRegistroAviso(index) {
  if (!confirm("¿Seguro que deseas eliminar este aviso?")) return;

  await fetch(`/api/avisos/${index}`, { method: "DELETE" });
  cargarAvisos();
}