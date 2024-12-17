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

    // Contenedor del título y botón de cerrar
    const contenedorTitulo = document.createElement('div');
    contenedorTitulo.classList.add('contenedor-titulo');

    const titulo = document.createElement('h3');
    titulo.textContent = 'Detalle del Carrito';
    contenedorTitulo.appendChild(titulo);

    const botonCerrar = document.createElement('button');
    botonCerrar.textContent = '×';
    botonCerrar.classList.add('boton-cerrar');
    botonCerrar.onclick = () => modal.remove();
    contenedorTitulo.appendChild(botonCerrar);

    modalContent.appendChild(contenedorTitulo);

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
                mostrarCarritoModal();
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

    // Contenedor para los botones de Vaciar Carrito y Comprar
    const contenedorBotones = document.createElement('div');
    contenedorBotones.classList.add('contenedor-botones');

    const botonVaciarCarrito = document.createElement('button');
    botonVaciarCarrito.textContent = 'Vaciar Carrito';
    botonVaciarCarrito.classList.add('boton-vaciar');
    botonVaciarCarrito.onclick = () => {
        carrito.vaciarCarrito();
        modal.remove();
        mostrarCarritoModal();
    };
    contenedorBotones.appendChild(botonVaciarCarrito);

    const botonComprar = document.createElement('button');
    botonComprar.textContent = 'Comprar';
    botonComprar.classList.add('boton-comprar');
    botonComprar.onclick = () => {
        modal.remove();
        mostrarCheckoutModal();
    };
    contenedorBotones.appendChild(botonComprar);

    modalContent.appendChild(contenedorBotones);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.classList.add('mostrar');
}

// Mostrar el formulario de checkout en un modal
function mostrarCheckoutModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal-checkout');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-checkout-content');

    const titulo = document.createElement('h3');
    titulo.textContent = 'Formulario de Checkout';
    modalContent.appendChild(titulo);

    // Campos del formulario
    const campos = [
        { label: 'Nombre', id: 'nombre', type: 'text' },
        { label: 'Teléfono', id: 'telefono', type: 'text' },
        { label: 'Email', id: 'email', type: 'email' },
        { label: 'Lugar de Entrega', id: 'lugar', type: 'text' },
        { label: 'Fecha de Entrega', id: 'fecha', type: 'date' },
    ];

    campos.forEach(campo => {
        const label = document.createElement('label');
        label.htmlFor = campo.id;
        label.textContent = campo.label;
        modalContent.appendChild(label);

        const input = document.createElement('input');
        input.type = campo.type;
        input.id = campo.id;
        input.name = campo.id;
        input.required = true;
        modalContent.appendChild(input);
    });

    // Campo select para el método de pago
    const labelMetodoPago = document.createElement('label');
    labelMetodoPago.htmlFor = 'metodo-pago';
    labelMetodoPago.textContent = 'Método de Pago';
    modalContent.appendChild(labelMetodoPago);

    const selectMetodoPago = document.createElement('select');
    selectMetodoPago.id = 'metodo-pago';
    selectMetodoPago.name = 'metodo-pago';
    selectMetodoPago.required = true;

    const opcionesMetodoPago = [
        { value: 'efectivo', text: 'Efectivo' },
        { value: 'debito', text: 'Tarjeta de Débito' },
        { value: 'credito', text: 'Tarjeta de Crédito' },
    ];

    opcionesMetodoPago.forEach(opcion => {
        const optionElement = document.createElement('option');
        optionElement.value = opcion.value;
        optionElement.textContent = opcion.text;
        selectMetodoPago.appendChild(optionElement);
    });

    modalContent.appendChild(selectMetodoPago);

    // Contenedor para el campo de cuotas (dinámico)
    const contenedorCuotas = document.createElement('div');
    contenedorCuotas.id = 'contenedor-cuotas';
    modalContent.appendChild(contenedorCuotas);

    // Manejar el cambio de método de pago para mostrar/ocultar el campo de cuotas
    selectMetodoPago.addEventListener('change', () => {
        if (selectMetodoPago.value === 'credito') {
            // Agregar campo de cuotas si no está presente
            if (!contenedorCuotas.querySelector('select')) {
                const labelCuotas = document.createElement('label');
                labelCuotas.htmlFor = 'cuotas';
                labelCuotas.textContent = 'Selecciona las cuotas';
                contenedorCuotas.appendChild(labelCuotas);

                const selectCuotas = document.createElement('select');
                selectCuotas.id = 'cuotas';
                selectCuotas.name = 'cuotas';

                const opcionesCuotas = [
                    { value: '3', text: '3 cuotas sin interés' },
                    { value: '6', text: '6 cuotas sin interés' },
                    { value: '12', text: '12 cuotas con interés' }
                ];

                opcionesCuotas.forEach(opcion => {
                    const optionElement = document.createElement('option');
                    optionElement.value = opcion.value;
                    optionElement.textContent = opcion.text;
                    selectCuotas.appendChild(optionElement);
                });

                contenedorCuotas.appendChild(selectCuotas);
            }
        } else {
            // Eliminar campo de cuotas si no se selecciona tarjeta de crédito
            contenedorCuotas.innerHTML = '';
        }
    });

    // Botones de acción
    const contenedorBotones = document.createElement('div');
    contenedorBotones.classList.add('contenedor-botones-checkout');

    const botonConfirmar = document.createElement('button');
    botonConfirmar.type = 'button';
    botonConfirmar.textContent = 'Confirmar Compra';
    botonConfirmar.classList.add('boton-confirmar');
    botonConfirmar.onclick = () => {
        const inputs = modalContent.querySelectorAll('input, select');
        let formularioValido = true;

        // Validar todos los campos
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                formularioValido = false;
                input.style.border = '2px solid #e74c3c';
            } else {
                input.style.border = '2px solid #27ae60';
            }
        });

        if (formularioValido) {
            carrito.vaciarCarrito();
            modal.remove();
        }
    };
    contenedorBotones.appendChild(botonConfirmar);
    const botonCancelar = document.createElement('button');
    botonCancelar.type = 'button';
    botonCancelar.textContent = 'Cancelar';
    botonCancelar.classList.add('boton-cancelar');
    botonCancelar.onclick = () => modal.remove();
    contenedorBotones.appendChild(botonCancelar);

    modalContent.appendChild(contenedorBotones);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.classList.add('mostrar');
}

function mostrarOfertaEspecial() {
    // Eliminar cualquier banner existente antes de crear uno nuevo
    const bannerExistente = document.getElementById('oferta-especial');
    if (bannerExistente) bannerExistente.remove();

    // Crear el banner
    const banner = document.createElement('div');
    banner.id = 'oferta-especial';
    banner.textContent = '¡Oferta Especial! Descuento del 20% en esta categoría durante tiempo limitado.';

    // Establecer la clase para aplicar los estilos
    banner.classList.add('banner-flotante');
    document.body.appendChild(banner);

    // Eliminar el banner después de 10 segundos
    setTimeout(() => banner.remove(), 10000);
}

// Modificar la función de filtrar productos
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
    mostrarOfertaEspecial(); // Mostrar el banner cuando se filtra la categoría
}

// Agregar eventos a los controles de filtro y ordenación
document.getElementById('filtro-categoria').addEventListener('change', filtrarYOrdenarProductos);
document.getElementById('ordenar').addEventListener('change', filtrarYOrdenarProductos);

// Agregar evento al botón "Ver Carrito"
document.getElementById('verCarrito').addEventListener('click', mostrarCarritoModal);

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);