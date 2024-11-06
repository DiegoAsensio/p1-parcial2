'use strict';

class Carrito {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarCarritoDOM();
    }

    // Agregar producto al carrito
    agregarProducto(producto) {
        const item = this.productos.find(p => p.id === producto.id);
        if (item) {
            item.cantidad++;
        } else {
            this.productos.push({ ...producto, cantidad: 1 });
        }
        this.actualizarStorage();
        this.actualizarCarritoDOM();
    }

    // Eliminar producto del carrito
    quitarProducto(id) {
        const itemIndex = this.productos.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const item = this.productos[itemIndex];
            item.cantidad--;

            // Si la cantidad llega a 0, lo eliminamos del array
            if (item.cantidad <= 0) {
                this.productos.splice(itemIndex, 1);
            }

            this.actualizarStorage();
            this.actualizarCarritoDOM();
        }
    }

    // Calcular total del carrito
    obtenerTotal() {
        return this.productos.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    }

    // Actualizar la visualización del carrito en el DOM
    actualizarCarritoDOM() {
        const carritoDOM = document.getElementById('carrito');
        if (!carritoDOM) {
            console.error('Elemento #carrito no encontrado en el DOM');
            return;
        }
    
        // Selecciona los elementos de cantidad y total de manera más precisa
        const cantidad = carritoDOM.querySelector('p:first-child span');
        const total = carritoDOM.querySelector('p:nth-child(2) span');
    
        if (cantidad && total) {
            const cantidadTotal = this.productos.reduce((acc, item) => acc + item.cantidad, 0);
            cantidad.textContent = cantidadTotal;
            total.textContent = this.obtenerTotal();
        } else {
            console.error('Elementos internos del #carrito no encontrados');
        }
    }
    

    // Guardar el estado del carrito en localStorage
    actualizarStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.productos));
    }
}

const carrito = new Carrito();

// Función para cargar productos y mostrarlos en la página
async function cargarProductos() {
    try {
        const response = await fetch('productos.json'); // Cambia esto si tienes los productos en un archivo JSON
        const productos = await response.json(); // O usa un array de productos directamente si lo defines en el script
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Mostrar productos en el DOM
function mostrarProductos(productos) {
    console.log(productos);
    const contenedor = document.getElementById('productos');
    contenedor.innerHTML = '';
    productos.forEach(prod => {
        const productoElemento = crearProductoElemento(prod);
        contenedor.appendChild(productoElemento);
    });
}

// Crear elemento de producto
function crearProductoElemento(producto) {
    const divProducto = document.createElement('div');
    divProducto.classList.add('producto');

    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre;
    divProducto.appendChild(img);

    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;
    divProducto.appendChild(nombre);

    const precio = document.createElement('p');
    precio.textContent = `$${producto.precio}`;
    divProducto.appendChild(precio);

    const botonAgregar = document.createElement('button');
    botonAgregar.textContent = 'Agregar al carrito';
    botonAgregar.onclick = () => carrito.agregarProducto(producto);
    divProducto.appendChild(botonAgregar);

    return divProducto;
}

// Mostrar detalles de un producto en un modal
function mostrarDetalleProducto(producto) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre;
    modalContent.appendChild(img);

    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;
    modalContent.appendChild(nombre);

    const descripcion = document.createElement('p');
    descripcion.textContent = producto.descripcion;
    modalContent.appendChild(descripcion);

    const precio = document.createElement('p');
    precio.textContent = `$${producto.precio}`;
    modalContent.appendChild(precio);

    const botonCerrar = document.createElement('button');
    botonCerrar.textContent = 'Volver';
    botonCerrar.onclick = () => modal.remove();
    modalContent.appendChild(botonCerrar);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Mostrar el contenido del carrito en un modal
function mostrarCarritoModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const titulo = document.createElement('h3');
    titulo.textContent = 'Detalle del Carrito';
    modalContent.appendChild(titulo);

    // Si el carrito está vacío
    if (carrito.productos.length === 0) {
        const mensajeVacio = document.createElement('p');
        mensajeVacio.textContent = 'El carrito está vacío.';
        modalContent.appendChild(mensajeVacio);
    } else {
        // Lista de productos en el carrito
        carrito.productos.forEach(producto => {
            const itemCarrito = document.createElement('div');
            itemCarrito.classList.add('item-carrito');

            const img = document.createElement('img');
            img.src = producto.imagen;
            img.alt = producto.nombre;
            img.classList.add('thumbnail');
            itemCarrito.appendChild(img);

            const nombre = document.createElement('p');
            nombre.textContent = `${producto.nombre} (x${producto.cantidad}) - $${producto.precio * producto.cantidad}`;
            itemCarrito.appendChild(nombre);

            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar';
            botonEliminar.onclick = () => {
                carrito.quitarProducto(producto.id);
                modal.remove();
                mostrarCarritoModal(); // Refresca el modal para mostrar los cambios
            };
            itemCarrito.appendChild(botonEliminar);

            modalContent.appendChild(itemCarrito);
        });

        // Total del carrito
        const total = document.createElement('p');
        total.textContent = `Total a pagar: $${carrito.obtenerTotal()}`;
        modalContent.appendChild(total);
    }

    // Botón para cerrar el modal
    const botonCerrar = document.createElement('button');
    botonCerrar.textContent = 'Cerrar';
    botonCerrar.onclick = () => modal.remove();
    modalContent.appendChild(botonCerrar);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Agregar el evento al botón "Ver Carrito"
document.getElementById('verCarrito').addEventListener('click', mostrarCarritoModal);

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
