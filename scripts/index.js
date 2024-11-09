'use strict';

// Clase Carrito que maneja los productos del carrito y las operaciones asociadas
class Carrito {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarCarritoDOM();
    }

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

    quitarProducto(id) {
        const itemIndex = this.productos.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const item = this.productos[itemIndex];
            item.cantidad--;
            if (item.cantidad <= 0) {
                this.productos.splice(itemIndex, 1);
            }
            this.actualizarStorage();
            this.actualizarCarritoDOM();
        }
    }

    vaciarCarrito() {
        this.productos = [];
        this.actualizarStorage();
        this.actualizarCarritoDOM();
    }

    obtenerTotal() {
        return this.productos.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    }

    actualizarCarritoDOM() {
        const carritoDOM = document.getElementById('carrito');
        if (!carritoDOM) {
            console.error('Elemento #carrito no encontrado en el DOM');
            return;
        }

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

    actualizarStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.productos));
    }
}

const carrito = new Carrito();

// Función para cargar productos desde productos.json
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const productos = await response.json();
        productosOriginales = productos;
        mostrarProductos(productosOriginales); // Mostrar todos los productos inicialmente
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        const contenedor = document.getElementById('productos');
        contenedor.innerHTML = '<p style="color: red;">Error al cargar los productos. Intenta recargar la página.</p>';
    }
}

// Variables globales
let productosOriginales = [];

// Mostrar productos en el DOM
function mostrarProductos(productos) {
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

    // Botón "Agregar al carrito"
    const botonAgregar = document.createElement('button');
    botonAgregar.textContent = 'Agregar al carrito';
    botonAgregar.onclick = () => carrito.agregarProducto(producto);
    divProducto.appendChild(botonAgregar);

    // Botón "Mostrar detalles"
    const botonDetalles = document.createElement('button');
    botonDetalles.textContent = 'Mostrar detalles';
    botonDetalles.onclick = () => mostrarDetalleProducto(producto);
    divProducto.appendChild(botonDetalles);

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
    modal.classList.add('mostrar');
}

// Mostrar el contenido del carrito en un modal
function mostrarCarritoModal() {
    // Elimina cualquier modal existente antes de crear uno nuevo
    const modalExistente = document.querySelector('.modal');
    if (modalExistente) {
        modalExistente.remove();
    }

    // Crear el modal
    const modal = document.createElement('div');
    modal.classList.add('modal-carrito');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-carrito-content');

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
            botonEliminar.textContent = '-';
            botonEliminar.onclick = () => {
                carrito.quitarProducto(producto.id);
                modal.remove();
                mostrarCarritoModal(); // Refresca el modal para mostrar los cambios
            };
            itemCarrito.appendChild(botonEliminar);

            // Crear botón para agregar producto (aumentar cantidad)
            const botonAgregar = document.createElement('button');
            botonAgregar.textContent = '+';
            botonAgregar.onclick = () => {
                carrito.agregarProducto(producto);
                modal.remove();
                mostrarCarritoModal();
            };
            itemCarrito.appendChild(botonAgregar);

            modalContent.appendChild(itemCarrito);
        });

        // Total del carrito
        const total = document.createElement('p');
        total.textContent = `Total a pagar: $${carrito.obtenerTotal()}`;
        modalContent.appendChild(total);
    }

    // Crear botón para vaciar todo el carrito
    const botonVaciarCarrito = document.createElement('button');
    botonVaciarCarrito.textContent = 'Vaciar Carrito';
    botonVaciarCarrito.onclick = () => {
        carrito.vaciarCarrito();
        modal.remove();
        mostrarCarritoModal();
    };
    modalContent.appendChild(botonVaciarCarrito);

    // Botón para cerrar el modal
    const botonCerrar = document.createElement('button');
    botonCerrar.textContent = 'Cerrar';
    botonCerrar.onclick = () => modal.remove();
    modalContent.appendChild(botonCerrar);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Mostrar el modal agregando la clase 'mostrar'
    modal.classList.add('mostrar');
}



// Filtrar y ordenar productos
function filtrarYOrdenarProductos() {
    let productosFiltrados = [...productosOriginales];

    const filtroCategoria = document.getElementById('filtro-categoria').value;
    if (filtroCategoria !== 'todos') {
        productosFiltrados = productosFiltrados.filter(prod => prod.categoria === filtroCategoria);
    }

    const orden = document.getElementById('ordenar').value;
    if (orden === 'alfabetico') {
        productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === 'precio-asc') {
        productosFiltrados.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'precio-desc') {
        productosFiltrados.sort((a, b) => b.precio - a.precio);
    }

    mostrarProductos(productosFiltrados);
}

// Agregar eventos a los controles de filtro y ordenación
document.getElementById('filtro-categoria').addEventListener('change', filtrarYOrdenarProductos);
document.getElementById('ordenar').addEventListener('change', filtrarYOrdenarProductos);

// Agregar evento al botón "Ver Carrito"
document.getElementById('verCarrito').addEventListener('click', mostrarCarritoModal);

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
