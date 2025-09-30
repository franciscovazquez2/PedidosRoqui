# PEDIDOS-AVISOS APP #

Pedidos-Avisos APP, consiste en una aplicación web desarrollada en HTML5, JS, CSS. El proyecto fue creado mediante Node.js.

La aplicación cumple con dos funcionalidades:

- Gestión de pedidos de productos a proveedores
- Control de pedidos realizados por los clientes del negocio.

### Gestión de pedidos a proovedores: ###

El sistema permite gestionar los productos que deben solicitarse a cada proveedor, permitiendo agregar o eliminar de los mismos los productos faltantes o recibidos.


### Control de pedidos realizados por los clientes: ###

El sistema permite agendar los clientes que han solicitado productos y llevar el seguimiento del proceso de venta de los productos. Permitiendo agendar clientes con pedidos pendientes y entregados.


## DESARROLLO DE APLICACION EN ENTORNO DE DESARROLLO Y EJECUCIÓN ##

Inicialización en entorno e instalacion de dependencias.

>npm init -y
>npm install express body-parser exceljs cors  

- **express**: framework para armar endpoints y levantar un servidor HTTP.
- **cors**: permite que el navegador haga peticiones al backend sin bloquearlas.
- **xlsx**: librería para leer y escribir archivos Excel .xlsx.

![estructura_proyecto-pedidos](image.png)



