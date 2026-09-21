// ===== Estado de la aplicación =====
let productos = [];          // Productos cargados desde el JSON
let carrito = [];            // Items: { id, nombre, precio, cantidad }
let categoriaActual = 'Todos';
let textoBusqueda = '';

const listaEl = document.getElementById('lista-productos');
const mensajeEl = document.getElementById('mensaje');

// ===== Fetch API: carga de productos desde JSON local =====
async function cargarProductos() {
    try {
        const respuesta = await fetch('assets/data/productos.json');
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        if (!Array.isArray(datos)) throw new Error('Formato de datos inválido');
        productos = datos;
        renderizarProductos();
    } catch (error) {
        // Gestión de errores: mensaje amigable para el usuario
        console.error('Error al cargar productos:', error);
        mostrarMensaje('danger', 'No pudimos cargar los productos. Intenta nuevamente más tarde.');
    }
}

// ===== Mensajes al usuario =====
function mostrarMensaje(tipo, texto) {
    mensajeEl.innerHTML = texto ? `<div class="alert alert-${tipo}">${texto}</div>` : '';
}

// ===== Filtra por categoría y texto de búsqueda =====
function filtrarProductos() {
    return productos.filter(p =>
        (categoriaActual === 'Todos' || p.plataforma === categoriaActual) &&
        p.nombre.toLowerCase().includes(textoBusqueda)
    );
}

// ===== Manipulación del DOM: dibuja las tarjetas de producto =====
function renderizarProductos() {
    const lista = filtrarProductos();
    listaEl.innerHTML = '';
    if (lista.length === 0) {
        mostrarMensaje('warning', 'No se encontraron productos para tu búsqueda.');
        return;
    }
    mostrarMensaje('', '');
    lista.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 card-producto shadow-sm">
                <img src="${p.imagen}" class="card-img-top" alt="${p.descripcion}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h3 class="h5 card-title">${p.nombre}</h3>
                    <p class="text-muted mb-1">${p.plataforma}</p>
                    <p class="fw-bold mb-3">$${p.precio} USD</p>
                    <button class="btn btn-primary mt-auto btn-agregar" data-id="${p.id}">Agregar al carrito</button>
                </div>
            </div>`;
        listaEl.appendChild(col);
    });
}

// ===== Carrito =====
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    const existente = carrito.find(i => i.id === id);
    if (existente) existente.cantidad++;
    else carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    renderizarCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    renderizarCarrito();
}

// Muestra el resumen del carrito en el área designada
function renderizarCarrito() {
    const ul = document.getElementById('carrito-items');
    ul.innerHTML = '';
    if (carrito.length === 0) {
        ul.innerHTML = '<li class="list-group-item text-muted">El carrito está vacío</li>';
    }
    carrito.forEach(i => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `<span>${i.nombre} x${i.cantidad}</span>
            <span>$${i.precio * i.cantidad}
            <button class="btn btn-sm btn-outline-secondary ms-2 btn-quitar" data-id="${i.id}" aria-label="Quitar ${i.nombre}">✕</button></span>`;
        ul.appendChild(li);
    });
    const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
    document.getElementById('carrito-total').textContent = total;
}

// ===== Eventos =====
function registrarEventos() {
    // click: agregar al carrito (delegación de eventos)
    listaEl.addEventListener('click', e => {
        const btn = e.target.closest('.btn-agregar');
        if (btn) agregarAlCarrito(Number(btn.dataset.id));
    });

    // click: quitar item del carrito
    document.getElementById('carrito-items').addEventListener('click', e => {
        const btn = e.target.closest('.btn-quitar');
        if (btn) quitarDelCarrito(Number(btn.dataset.id));
    });

    // click: vaciar carrito
    document.getElementById('btn-vaciar').addEventListener('click', () => {
        carrito = [];
        renderizarCarrito();
    });

    // submit: formulario de búsqueda
    document.getElementById('form-busqueda').addEventListener('submit', e => {
        e.preventDefault();
        textoBusqueda = document.getElementById('input-busqueda').value.trim().toLowerCase();
        renderizarProductos();
    });

    // click: categorías de la barra de navegación
    document.querySelectorAll('[data-categoria]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            categoriaActual = link.dataset.categoria;
            document.querySelectorAll('[data-categoria]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            renderizarProductos();
        });
    });
}

// ===== Inicio =====
registrarEventos();
renderizarCarrito();
cargarProductos();
