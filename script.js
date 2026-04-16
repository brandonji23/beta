/* ============================================================
   BETA — Sistema de Gestión de Inventarios
   Lógica completa en JavaScript vanilla
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILIDADES
     ---------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const LS = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  };

  function fmtMoney(n) {
    return '$' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function fmtDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('es-CL');
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ----------------------------------------------------------
     DATOS DE DEMO
     ---------------------------------------------------------- */
  function seedData() {
    if (LS.get('beta_seeded')) return;

    const usuarios = [
      {id: uid(), usuario: 'prueba', pass: 'contraseñaprueba', rol: 'superAdmin'}
    ]
    LS.set('usuarios', usuarios)

    const proveedores = [
      { id: uid(), empresa: 'Distribuidora Central', contacto: 'María López', telefono: '+56 9 1234 5678', email: 'maria@distcentral.cl', ciudad: 'Santiago', categorias: 'Electrónica', notas: 'Entrega rápida', fecha: '2024-01-15' },
      { id: uid(), empresa: 'Suministros del Sur', contacto: 'Carlos Pérez', telefono: '+56 9 8765 4321', email: 'carlos@sumsur.cl', ciudad: 'Concepción', categorias: 'Ropa', notas: 'Precios competitivos', fecha: '2024-02-20' },
      { id: uid(), empresa: 'Importadora Norte', contacto: 'Ana Torres', telefono: '+56 9 5555 1234', email: 'ana@impnorte.cl', ciudad: 'Antofagasta', categorias: 'Hogar', notas: 'Mínimo 50 unidades', fecha: '2024-03-10' }
    ];
    LS.set('proveedores', proveedores);

    const productos = [
      { id: uid(), nombre: 'Laptop ProMax 15"', categoria: 'Electrónica', descripcion: 'Laptop de alto rendimiento', proveedor: proveedores[0].id, precioCompra: 450000, precioVenta: 720000, stock: 12, sku: 'EL-001', imagen: '' },
      { id: uid(), nombre: 'Mouse Inalámbrico', categoria: 'Electrónica', descripcion: 'Mouse ergonómico BT', proveedor: proveedores[0].id, precioCompra: 8000, precioVenta: 15000, stock: 45, sku: 'EL-002', imagen: '' },
      { id: uid(), nombre: 'Teclado Mecánico RGB', categoria: 'Electrónica', descripcion: 'Switches azules', proveedor: proveedores[0].id, precioCompra: 25000, precioVenta: 42000, stock: 3, sku: 'EL-003', imagen: '' },
      { id: uid(), nombre: 'Camiseta Algodón', categoria: 'Ropa', descripcion: 'Talla M, varias colores', proveedor: proveedores[1].id, precioCompra: 3500, precioVenta: 8900, stock: 80, sku: 'RO-001', imagen: '' },
      { id: uid(), nombre: 'Jeans Slim Fit', categoria: 'Ropa', descripcion: 'Denim premium', proveedor: proveedores[1].id, precioCompra: 12000, precioVenta: 29900, stock: 25, sku: 'RO-002', imagen: '' },
      { id: uid(), nombre: 'Juego de Sábanas', categoria: 'Hogar', descripcion: '2 plazas, 400 hilos', proveedor: proveedores[2].id, precioCompra: 15000, precioVenta: 32000, stock: 0, sku: 'HO-001', imagen: '' },
      { id: uid(), nombre: 'Lámpara de Escritorio', categoria: 'Hogar', descripcion: 'LED regulable', proveedor: proveedores[2].id, precioCompra: 9000, precioVenta: 18500, stock: 4, sku: 'HO-002', imagen: '' },
      { id: uid(), nombre: 'Monitor 27" 4K', categoria: 'Electrónica', descripcion: 'HDR, 144Hz', proveedor: proveedores[0].id, precioCompra: 180000, precioVenta: 299000, stock: 7, sku: 'EL-004', imagen: '' }
    ];
    LS.set('productos', productos);

    const clientes = [
      { id: uid(), nombre: 'Juan Martínez', rut: '12.345.678-9', email: 'juan@correo.cl', telefono: '+56 9 1111 2222', ciudad: 'Santiago' },
      { id: uid(), nombre: 'Sofía Herrera', rut: '13.456.789-0', email: 'sofia@correo.cl', telefono: '+56 9 3333 4444', ciudad: 'Valparaíso' },
      { id: uid(), nombre: 'Diego Rojas', rut: '14.567.890-1', email: 'diego@correo.cl', telefono: '+56 9 5555 6666', ciudad: 'Temuco' },
      { id: uid(), nombre: 'Valentina Soto', rut: '15.678.901-2', email: 'vale@correo.cl', telefono: '+56 9 7777 8888', ciudad: 'Concepción' },
      { id: uid(), nombre: 'Matías Fernández', rut: '16.789.012-3', email: 'matias@correo.cl', telefono: '+56 9 9999 0000', ciudad: 'La Serena' }
    ];
    LS.set('clientes', clientes);

    const now = new Date();
    const ventas = [
      { id: uid(), factura: 'BETA-2024-0001', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(), clienteId: clientes[0].id, items: [{ productoId: productos[0].id, nombre: productos[0].nombre, precio: 720000, cantidad: 1 }, { productoId: productos[1].id, nombre: productos[1].nombre, precio: 15000, cantidad: 2 }], subtotal: 750000, iva: 142500, descuento: 0, total: 892500, metodoPago: 'Tarjeta', estado: 'Pagado' },
      { id: uid(), factura: 'BETA-2024-0002', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(), clienteId: clientes[1].id, items: [{ productoId: productos[3].id, nombre: productos[3].nombre, precio: 8900, cantidad: 3 }], subtotal: 26700, iva: 5073, descuento: 0, total: 31773, metodoPago: 'Efectivo', estado: 'Pagado' },
      { id: uid(), factura: 'BETA-2024-0003', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(), clienteId: clientes[2].id, items: [{ productoId: productos[7].id, nombre: productos[7].nombre, precio: 299000, cantidad: 1 }, { productoId: productos[6].id, nombre: productos[6].nombre, precio: 18500, cantidad: 2 }], subtotal: 336000, iva: 63840, descuento: 5000, total: 394840, metodoPago: 'Transferencia', estado: 'Pendiente' },
      { id: uid(), factura: 'BETA-2024-0004', fecha: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(), clienteId: clientes[3].id, items: [{ productoId: productos[4].id, nombre: productos[4].nombre, precio: 29900, cantidad: 2 }], subtotal: 59800, iva: 11362, descuento: 0, total: 71162, metodoPago: 'Tarjeta', estado: 'Pagado' }
    ];
    LS.set('ventas', ventas);

    const guias = [
      { id: uid(), numero: 'GD-2024-0001', ventaId: ventas[0].id, factura: ventas[0].factura, clienteId: clientes[0].id, direccion: 'Av. Providencia 1234, Santiago', transportista: 'Chilexpress', seguimiento: 'CX123456789', estado: 'Entregado', actualizado: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString() },
      { id: uid(), numero: 'GD-2024-0002', ventaId: ventas[1].id, factura: ventas[1].factura, clienteId: clientes[1].id, direccion: 'Pasaje Los Robles 56, Valparaíso', transportista: 'Starken', seguimiento: 'SK987654321', estado: 'En Despacho', actualizado: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString() },
      { id: uid(), numero: 'GD-2024-0003', ventaId: ventas[2].id, factura: ventas[2].factura, clienteId: clientes[2].id, direccion: 'Calle Temuco 789, Temuco', transportista: 'Blue Express', seguimiento: 'BX456789123', estado: 'En Bodega', actualizado: new Date().toISOString() }
    ];
    LS.set('guias', guias);

    LS.set('beta_seeded', true);
    LS.set('factura_counter', 4);
    LS.set('guia_counter', 3);

  }

  /* ----------------------------------------------------------
     ESTADO GLOBAL
     ---------------------------------------------------------- */
  const currentUser = LS.get('currentUser') || {rol: 'admin', usuario: 'AD'};
  let currentModule = 'dashboard';
  let ventasTab = 'historial';

  function getData(key) { return LS.get(key) || []; }
  function saveData(key, data) { LS.set(key, data); }

  function getCliente(id) { return getData('clientes').find(c => c.id === id); }
  function getProveedor(id) { return getData('proveedores').find(p => p.id === id); }
  function getProducto(id) { return getData('productos').find(p => p.id === id); }

  function nextFactura() {
    let c = (LS.get('factura_counter') || 0) + 1;
    LS.set('factura_counter', c);
    return 'BETA-' + new Date().getFullYear() + '-' + String(c).padStart(4, '0');
  }

  function nextGuia() {
    let c = (LS.get('guia_counter') || 0) + 1;
    LS.set('guia_counter', c);
    return 'GD-' + new Date().getFullYear() + '-' + String(c).padStart(4, '0');
  }

  /* ----------------------------------------------------------
     TOAST
     ---------------------------------------------------------- */
  function toast(msg, type) {
    type = type || 'success';
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = $('#toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = '<span class="toast-icon">' + (icons[type] || '') + '</span><span class="toast-msg">' + msg + '</span><button class="toast-close">&times;</button>';
    container.appendChild(el);
    el.querySelector('.toast-close').onclick = () => removeToast(el);
    setTimeout(() => removeToast(el), 3500);
  }

  function removeToast(el) {
    if (!el || el.classList.contains('removing')) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }

  /* ----------------------------------------------------------
     MODAL
     ---------------------------------------------------------- */
  function openModal(title, bodyHTML, footerHTML) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHTML;
    $('#modalFooter').innerHTML = footerHTML || '';
    $('#modalOverlay').classList.remove('hidden');
  }

  function closeModal() {
    $('#modalOverlay').classList.add('hidden');
  }

  $('#modalClose').onclick = closeModal;
  $('#modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  /* ----------------------------------------------------------
     PAGINACIÓN
     ---------------------------------------------------------- */
  function paginate(items, page, perPage) {
    perPage = perPage || 10;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    page = Math.max(1, Math.min(page, totalPages));
    const start = (page - 1) * perPage;
    return { data: items.slice(start, start + perPage), page, totalPages, total: items.length };
  }

  function renderPagination(totalPages, currentPage, onPage) {
    if (totalPages <= 1) return '';
    let html = '<div class="pagination">';
    html += '<button ' + (currentPage === 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">&laquo;</button>';
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
        if (i === 4 || i === totalPages - 3) html += '<button disabled>...</button>';
        continue;
      }
      html += '<button class="' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">&raquo;</button>';
    html += '</div>';
    return html;
  }

  function bindPagination(container, callback) {
    container.querySelectorAll('.pagination button').forEach(btn => {
      btn.addEventListener('click', function () {
        const p = parseInt(this.dataset.page);
        if (!isNaN(p)) callback(p);
      });
    });
  }

  /* ----------------------------------------------------------
     SIDEBAR & NAV
     ---------------------------------------------------------- */
  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebarToggle');
  const navItems = $$('.nav-item');

  sidebarToggle.onclick = function () {
    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed');
  };

  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const mod = this.dataset.module;
      if (mod === currentModule) return;
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      currentModule = mod;
      renderModule();
    });
  });

  /* Init role permissions */
  if (currentUser) {
    if ($('#avatarInitials')) $('#avatarInitials').textContent = currentUser.usuario.substring(0, 2).toUpperCase();
    if ($('#logoutBtn')) {
      $('#logoutBtn').addEventListener('click', function() {
        LS.set('currentUser', null);
        window.location.href = 'auth.html';
      });
    }

    if (currentUser.rol === 'superAdmin') {
       navItems.forEach(n => {
         const mod = n.dataset.module;
         if (mod !== 'negocios' && mod !== 'usuarios') n.style.display = 'none';
       });
       if ($('#navNegocios')) $('#navNegocios').style.display = 'flex';
       if ($('#navUsuarios')) $('#navUsuarios').style.display = 'flex';
       currentModule = 'negocios';
    } else if (currentUser.rol === 'admin') {
       if ($('#navUsuarios')) $('#navUsuarios').style.display = 'flex';
    } else if (currentUser.rol === 'bodeguero') {
       navItems.forEach(n => {
         const mod = n.dataset.module;
         if (mod !== 'inventario' && mod !== 'despacho') n.style.display = 'none';
       });
       currentModule = 'inventario';
    } else if (currentUser.rol === 'vendedor') {
       navItems.forEach(n => {
         const mod = n.dataset.module;
         if (mod !== 'dashboard' && mod !== 'inventario' && mod !== 'ventas' && mod !== 'clientes') n.style.display = 'none';
       });
       currentModule = 'ventas';
    }
    
    navItems.forEach(n => n.classList.remove('active'));
    navItems.forEach(n => {
      if (n.dataset.module === currentModule) n.classList.add('active');
    });
  }

  /* ----------------------------------------------------------
     RENDER MODULES
     ---------------------------------------------------------- */
  function renderModule() {
    const titles = {
      dashboard: 'Dashboard',
      inventario: 'Inventario',
      ventas: 'Ventas',
      proveedores: 'Proveedores',
      clientes: 'Clientes',
      despacho: 'Guías de Despacho'
    };
    $('#pageTitle').textContent = titles[currentModule] || '';
    updateNotifBadge();

    switch (currentModule) {
      case 'dashboard': renderDashboard(); break;
      case 'inventario': renderInventario(); break;
      case 'ventas': renderVentas(); break;
      case 'proveedores': renderProveedores(); break;
      case 'clientes': renderClientes(); break;
      case 'despacho': renderDespacho(); break;
      case 'negocios': renderNegocios(); break;
      case 'usuarios': renderUsuarios(); break;
    }
  }

  function updateNotifBadge() {
    const prods = getData('productos');
    const lowStock = prods.filter(p => p.stock > 0 && p.stock < 5).length;
    const outStock = prods.filter(p => p.stock === 0).length;
    const count = lowStock + outStock;
    const badge = $('#notifBadge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ----------------------------------------------------------
     DASHBOARD
     ---------------------------------------------------------- */
  function renderDashboard() {
    const ventas = getData('ventas');
    const productos = getData('productos');
    const proveedores = getData('proveedores');

    const now = new Date();
    const thisMonth = ventas.filter(v => {
      const d = new Date(v.fecha);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && v.estado !== 'Cancelado';
    });

    const totalVentasMes = thisMonth.length;
    const ingresosMes = thisMonth.reduce((s, v) => s + v.total, 0);
    const productosActivos = productos.filter(p => p.stock > 0).length;
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 5).length;
    const pedidosPendientes = ventas.filter(v => v.estado === 'Pendiente').length;

    let html = '<div class="kpi-grid">';
    html += kpiCard('blue', '📊', totalVentasMes, 'Ventas del Mes');
    html += kpiCard('green', '💰', fmtMoney(ingresosMes), 'Ingresos Totales');
    html += kpiCard('blue', '📦', productosActivos, 'Productos Activos');
    html += kpiCard(stockBajo > 0 ? 'orange' : 'green', '⚠️', stockBajo, 'Alertas Stock Bajo');
    html += kpiCard('blue', '🏢', proveedores.length, 'Total Proveedores');
    html += kpiCard(pedidosPendientes > 0 ? 'red' : 'green', '🕐', pedidosPendientes, 'Pedidos Pendientes');
    html += '</div>';

    html += '<div class="grid-2">';

    /* Chart */
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-title">Ventas</span>';
    html += '<select id="chartFilter" class="form-control" style="width:auto;padding:5px 28px 5px 10px;font-size:11px;">';
    html += '<option value="week">Esta Semana</option><option value="month" selected>Este Mes</option><option value="year">Este Año</option>';
    html += '</select></div>';
    html += '<div class="card-body"><div class="chart-container"><canvas id="salesChart"></canvas></div></div>';
    html += '</div>';

    /* Top products */
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-title">Productos Más Vendidos</span></div>';
    html += '<div class="card-body" id="topProductsPanel"></div>';
    html += '</div>';

    html += '</div>';

    html += '<div class="grid-2">';

    /* Recent sales */
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-title">Ventas Recientes</span></div>';
    html += '<div class="card-body"><div class="table-wrapper"><table><thead><tr><th>Cliente</th><th>Productos</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>';
    const recent = ventas.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    if (recent.length === 0) {
      html += '<tr><td colspan="5" class="text-center text-muted" style="padding:24px">Sin ventas registradas</td></tr>';
    }
    recent.forEach(v => {
      const cl = getCliente(v.clienteId);
      const badgeCls = v.estado === 'Pagado' ? 'badge-green' : v.estado === 'Pendiente' ? 'badge-orange' : 'badge-red';
      html += '<tr><td>' + (cl ? cl.nombre : '—') + '</td><td>' + v.items.length + ' producto(s)</td><td>' + fmtMoney(v.total) + '</td><td>' + fmtDate(v.fecha) + '</td><td><span class="badge ' + badgeCls + '">' + v.estado + '</span></td></tr>';
    });
    html += '</tbody></table></div></div></div>';

    /* Stock alerts */
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-title">Alertas de Stock</span></div>';
    html += '<div class="card-body" id="stockAlertsPanel"></div>';
    html += '</div>';

    html += '</div>';

    $('#contentArea').innerHTML = html;

    renderTopProducts();
    renderStockAlerts();
    drawChart('month');

    $('#chartFilter').addEventListener('change', function () {
      drawChart(this.value);
    });
  }

  function kpiCard(color, icon, value, label) {
    return '<div class="kpi-card ' + color + '"><div class="kpi-icon">' + icon + '</div><div class="kpi-info"><div class="kpi-value">' + value + '</div><div class="kpi-label">' + label + '</div></div></div>';
  }

  function renderTopProducts() {
    const ventas = getData('ventas').filter(v => v.estado !== 'Cancelado');
    const counts = {};
    ventas.forEach(v => {
      v.items.forEach(it => {
        counts[it.nombre] = (counts[it.nombre] || 0) + it.cantidad;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted.length > 0 ? sorted[0][1] : 1;
    let html = '';
    if (sorted.length === 0) {
      html = '<div class="empty-state"><div class="empty-icon">📊</div><p>Sin datos de ventas</p></div>';
    } else {
      sorted.forEach(([name, count]) => {
        const pct = Math.round((count / max) * 100);
        html += '<div class="progress-item"><span class="p-name" title="' + name + '">' + name + '</span><div class="p-bar"><div class="p-fill" style="width:' + pct + '%"></div></div><span class="p-count">' + count + '</span></div>';
      });
    }
    $('#topProductsPanel').innerHTML = html;
  }

  function renderStockAlerts() {
    const prods = getData('productos');
    const alerts = prods.filter(p => p.stock < 5).sort((a, b) => a.stock - b.stock);
    let html = '';
    if (alerts.length === 0) {
      html = '<div class="empty-state"><div class="empty-icon">✅</div><p>No hay alertas de stock</p></div>';
    } else {
      alerts.forEach(p => {
        const cls = p.stock === 0 ? 'out-stock' : 'low-stock';
        const label = p.stock === 0 ? 'Agotado' : 'Stock bajo: ' + p.stock;
        html += '<div class="alert-item ' + cls + '"><span>' + p.nombre + '</span><span class="badge ' + (p.stock === 0 ? 'badge-red' : 'badge-orange') + '">' + label + '</span></div>';
      });
    }
    $('#stockAlertsPanel').innerHTML = html;
  }

  /* CHART */
  function drawChart(filter) {
    const canvas = $('#salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const W = rect.width;
    const H = rect.height;

    const ventas = getData('ventas').filter(v => v.estado !== 'Cancelado');
    const now = new Date();
    let labels = [];
    let values = [];

    if (filter === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        labels.push(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]);
        values.push(ventas.filter(v => v.fecha.slice(0, 10) === key).reduce((s, v) => s + v.total, 0));
      }
    } else if (filter === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const key = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
        labels.push(String(i));
        values.push(ventas.filter(v => v.fecha.slice(0, 10) === key).reduce((s, v) => s + v.total, 0));
      }
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let m = 0; m < 12; m++) {
        labels.push(months[m]);
        values.push(ventas.filter(v => {
          const d = new Date(v.fecha);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
        }).reduce((s, v) => s + v.total, 0));
      }
    }

    ctx.clearRect(0, 0, W, H);
    const pad = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...values, 1);

    /* Grid lines */
    ctx.strokeStyle = '#E0E6ED';
    ctx.lineWidth = 0.5;
    ctx.font = '10px Inter, system-ui';
    ctx.fillStyle = '#5A6A7E';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      const val = Math.round(maxVal * i / 4);
      ctx.fillText(val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? Math.round(val / 1000) + 'K' : val, pad.left - 8, y + 3);
    }

    /* Bars */
    const barCount = values.length;
    const gap = 4;
    const barW = Math.max(4, (chartW / barCount) - gap);

    ctx.textAlign = 'center';
    values.forEach((val, i) => {
      const x = pad.left + i * (chartW / barCount) + (chartW / barCount - barW) / 2;
      const barH = (val / maxVal) * chartH;
      const y = pad.top + chartH - barH;

      const grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
      grad.addColorStop(0, '#1E88E5');
      grad.addColorStop(1, '#42A5F5');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      /* Label */
      ctx.fillStyle = '#5A6A7E';
      if (barCount <= 12 || i % Math.ceil(barCount / 15) === 0) {
        ctx.fillText(labels[i], x + barW / 2, H - pad.bottom + 16);
      }
    });
  }

  /* ----------------------------------------------------------
     INVENTARIO
     ---------------------------------------------------------- */
  let invPage = 1;
  let invSearch = '';
  let invFilterCat = '';
  let invFilterProv = '';
  let invFilterDisp = '';

  function renderInventario() {
    const productos = getData('productos');
    const proveedores = getData('proveedores');
    const categorias = [...new Set(productos.map(p => p.categoria))];

    let html = '<div class="toolbar">';
    html += '<div class="search-box"><input type="text" id="invSearch" placeholder="Buscar producto..." value="' + escAttr(invSearch) + '"></div>';
    html += '<select id="invFilterCat"><option value="">Todas las Categorías</option>';
    categorias.forEach(c => { html += '<option value="' + escAttr(c) + '" ' + (invFilterCat === c ? 'selected' : '') + '>' + esc(c) + '</option>'; });
    html += '</select>';
    html += '<select id="invFilterProv"><option value="">Todos los Proveedores</option>';
    proveedores.forEach(p => { html += '<option value="' + p.id + '" ' + (invFilterProv === p.id ? 'selected' : '') + '>' + esc(p.empresa) + '</option>'; });
    html += '</select>';
    html += '<select id="invFilterDisp"><option value="">Disponibilidad</option><option value="disponible" ' + (invFilterDisp === 'disponible' ? 'selected' : '') + '>Disponible</option><option value="bajo" ' + (invFilterDisp === 'bajo' ? 'selected' : '') + '>Stock Bajo</option><option value="agotado" ' + (invFilterDisp === 'agotado' ? 'selected' : '') + '>Agotado</option></select>';
    html += '<button class="btn btn-secondary btn-sm" id="exportCsvBtn">📥 Exportar CSV</button>';
    if (currentUser.rol !== 'vendedor') {
      html += '<button class="btn btn-primary" id="addProductBtn">+ Agregar Producto</button>';
    }
    html += '</div>';

    let filtered = productos.slice();
    if (invSearch) {
      const q = invSearch.toLowerCase();
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (invFilterCat) filtered = filtered.filter(p => p.categoria === invFilterCat);
    if (invFilterProv) filtered = filtered.filter(p => p.proveedor === invFilterProv);
    if (invFilterDisp === 'disponible') filtered = filtered.filter(p => p.stock >= 5);
    if (invFilterDisp === 'bajo') filtered = filtered.filter(p => p.stock > 0 && p.stock < 5);
    if (invFilterDisp === 'agotado') filtered = filtered.filter(p => p.stock === 0);

    const paged = paginate(filtered, invPage);

    html += '<div class="card"><div class="table-wrapper"><table><thead><tr>';
    html += '<th>ID</th><th>Producto</th><th>Categoría</th><th>Proveedor</th><th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Estado</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';

    if (paged.data.length === 0) {
      html += '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos que coincidan</p><button class="btn btn-primary" onclick="document.getElementById(\'addProductBtn\').click()">+ Agregar Producto</button></div></td></tr>';
    }

    paged.data.forEach(p => {
      const prov = getProveedor(p.proveedor);
      let estado, badgeCls;
      if (p.stock === 0) { estado = 'Agotado'; badgeCls = 'badge-red'; }
      else if (p.stock < 5) { estado = 'Stock Bajo'; badgeCls = 'badge-orange'; }
      else { estado = 'Disponible'; badgeCls = 'badge-green'; }

      html += '<tr>';
      html += '<td class="text-muted fs-11">' + esc(p.sku) + '</td>';
      html += '<td class="fw-600">' + esc(p.nombre) + '</td>';
      html += '<td>' + esc(p.categoria) + '</td>';
      html += '<td>' + (prov ? esc(prov.empresa) : '—') + '</td>';
      html += '<td>' + fmtMoney(p.precioCompra) + '</td>';
      html += '<td>' + fmtMoney(p.precioVenta) + '</td>';
      html += '<td>' + p.stock + '</td>';
      html += '<td><span class="badge ' + badgeCls + '">' + estado + '</span></td>';
      if (currentUser.rol !== 'vendedor') {
        html += '<td><div style="display:flex;gap:4px">';
        html += '<button class="btn-icon" data-action="stock-down" data-id="' + p.id + '" title="Restar stock">−</button>';
        html += '<button class="btn-icon" data-action="stock-up" data-id="' + p.id + '" title="Sumar stock">+</button>';
        html += '<button class="btn-icon" data-action="edit-product" data-id="' + p.id + '" title="Editar">✏️</button>';
        html += '<button class="btn-icon danger" data-action="delete-product" data-id="' + p.id + '" title="Eliminar">🗑️</button>';
        html += '</div></td>';
      } else {
        html += '<td><span class="text-muted fs-11">Solo lectura</span></td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += renderPagination(paged.totalPages, paged.page);
    html += '</div>';

    $('#contentArea').innerHTML = html;

    /* Events */
    $('#invSearch').addEventListener('input', function () { invSearch = this.value; invPage = 1; renderInventario(); });
    $('#invFilterCat').addEventListener('change', function () { invFilterCat = this.value; invPage = 1; renderInventario(); });
    $('#invFilterProv').addEventListener('change', function () { invFilterProv = this.value; invPage = 1; renderInventario(); });
    $('#invFilterDisp').addEventListener('change', function () { invFilterDisp = this.value; invPage = 1; renderInventario(); });
    $('#addProductBtn').addEventListener('click', () => openProductModal());
    $('#exportCsvBtn').addEventListener('click', () => exportProductsCsv());

    bindPagination($('#contentArea'), p => { invPage = p; renderInventario(); });

    /* Table actions */
    $$('[data-action]', $('#contentArea')).forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const id = this.dataset.id;
        if (action === 'edit-product') openProductModal(id);
        if (action === 'delete-product') confirmDelete('producto', id);
        if (action === 'stock-up') adjustStock(id, 1);
        if (action === 'stock-down') adjustStock(id, -1);
      });
    });
  }

  function adjustStock(id, delta) {
    const prods = getData('productos');
    const idx = prods.findIndex(p => p.id === id);
    if (idx === -1) return;
    prods[idx].stock = Math.max(0, prods[idx].stock + delta);
    saveData('productos', prods);
    toast('Stock actualizado: ' + prods[idx].nombre + ' → ' + prods[idx].stock);
    renderInventario();
  }

  function openProductModal(editId) {
    const proveedores = getData('proveedores');
    const isEdit = !!editId;
    const prod = isEdit ? getProducto(editId) : {};

    let body = '<div class="form-row">';
    body += '<div class="form-group"><label>Nombre *</label><input class="form-control" id="fProdNombre" value="' + escAttr(prod.nombre || '') + '"></div>';
    body += '<div class="form-group"><label>Categoría *</label><input class="form-control" id="fProdCat" value="' + escAttr(prod.categoria || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-group"><label>Descripción</label><textarea class="form-control" id="fProdDesc">' + esc(prod.descripcion || '') + '</textarea></div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Proveedor</label><select class="form-control" id="fProdProv"><option value="">Seleccionar...</option>';
    proveedores.forEach(p => { body += '<option value="' + p.id + '" ' + (prod.proveedor === p.id ? 'selected' : '') + '>' + esc(p.empresa) + '</option>'; });
    body += '</select></div>';
    body += '<div class="form-group"><label>SKU</label><input class="form-control" id="fProdSku" value="' + escAttr(prod.sku || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Precio Compra *</label><input type="number" class="form-control" id="fProdPC" value="' + (prod.precioCompra || '') + '"></div>';
    body += '<div class="form-group"><label>Precio Venta *</label><input type="number" class="form-control" id="fProdPV" value="' + (prod.precioVenta || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Stock *</label><input type="number" class="form-control" id="fProdStock" value="' + (prod.stock !== undefined ? prod.stock : '') + '"></div>';
    body += '<div class="form-group"><label>URL Imagen</label><input class="form-control" id="fProdImg" value="' + escAttr(prod.imagen || '') + '"></div>';
    body += '</div>';

    const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">' + (isEdit ? 'Guardar Cambios' : 'Agregar Producto') + '</button>';

    openModal(isEdit ? 'Editar Producto' : 'Agregar Producto', body, footer);

    $('#modalCancelBtn').onclick = closeModal;
    $('#modalSaveBtn').onclick = function () {
      const nombre = $('#fProdNombre').value.trim();
      const categoria = $('#fProdCat').value.trim();
      const precioCompra = parseFloat($('#fProdPC').value);
      const precioVenta = parseFloat($('#fProdPV').value);
      const stock = parseInt($('#fProdStock').value);

      if (!nombre || !categoria || isNaN(precioCompra) || isNaN(precioVenta) || isNaN(stock)) {
        toast('Completa todos los campos obligatorios', 'error');
        return;
      }

      const prods = getData('productos');
      const obj = {
        id: isEdit ? editId : uid(),
        nombre,
        categoria,
        descripcion: $('#fProdDesc').value.trim(),
        proveedor: $('#fProdProv').value,
        precioCompra,
        precioVenta,
        stock,
        sku: $('#fProdSku').value.trim(),
        imagen: $('#fProdImg').value.trim()
      };

      if (isEdit) {
        const idx = prods.findIndex(p => p.id === editId);
        if (idx !== -1) prods[idx] = obj;
      } else {
        prods.push(obj);
      }
      saveData('productos', prods);
      toast(isEdit ? 'Producto actualizado' : 'Producto agregado');
      closeModal();
      renderInventario();
    };
  }

  function exportProductsCsv() {
    const prods = getData('productos');
    const proveedores = getData('proveedores');
    let csv = 'SKU,Nombre,Categoría,Proveedor,Precio Compra,Precio Venta,Stock\n';
    prods.forEach(p => {
      const prov = proveedores.find(pr => pr.id === p.proveedor);
      csv += '"' + p.sku + '","' + p.nombre + '","' + p.categoria + '","' + (prov ? prov.empresa : '') + '",' + p.precioCompra + ',' + p.precioVenta + ',' + p.stock + '\n';
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventario_beta.csv';
    a.click();
    toast('CSV exportado correctamente');
  }

  /* ----------------------------------------------------------
     VENTAS
     ---------------------------------------------------------- */
  let ventasPage = 1;
  let ventasFilterEstado = '';
  let ventasFilterDesde = '';
  let ventasFilterHasta = '';
  let cart = [];

  function renderVentas() {
    let html = '<div class="tabs">';
    html += '<button class="tab-btn ' + (ventasTab === 'historial' ? 'active' : '') + '" data-tab="historial">Historial de Ventas</button>';
    html += '<button class="tab-btn ' + (ventasTab === 'nueva' ? 'active' : '') + '" data-tab="nueva">+ Nueva Venta</button>';
    html += '</div>';

    html += '<div id="ventasContent"></div>';
    $('#contentArea').innerHTML = html;

    $$('.tab-btn', $('#contentArea')).forEach(btn => {
      btn.addEventListener('click', function () {
        ventasTab = this.dataset.tab;
        renderVentas();
      });
    });

    if (ventasTab === 'historial') renderVentasHistorial();
    else renderNuevaVenta();
  }

  function renderVentasHistorial() {
    const ventas = getData('ventas');

    let html = '<div class="toolbar">';
    html += '<div class="form-group" style="margin-bottom:0"><label style="margin-bottom:2px">Desde</label><input type="date" class="form-control" id="vFDesde" value="' + ventasFilterDesde + '"></div>';
    html += '<div class="form-group" style="margin-bottom:0"><label style="margin-bottom:2px">Hasta</label><input type="date" class="form-control" id="vFHasta" value="' + ventasFilterHasta + '"></div>';
    html += '<select id="vFEstado"><option value="">Todos los Estados</option><option value="Pagado" ' + (ventasFilterEstado === 'Pagado' ? 'selected' : '') + '>Pagado</option><option value="Pendiente" ' + (ventasFilterEstado === 'Pendiente' ? 'selected' : '') + '>Pendiente</option><option value="Cancelado" ' + (ventasFilterEstado === 'Cancelado' ? 'selected' : '') + '>Cancelado</option></select>';
    html += '</div>';

    let filtered = ventas.slice();
    if (ventasFilterEstado) filtered = filtered.filter(v => v.estado === ventasFilterEstado);
    if (ventasFilterDesde) filtered = filtered.filter(v => v.fecha.slice(0, 10) >= ventasFilterDesde);
    if (ventasFilterHasta) filtered = filtered.filter(v => v.fecha.slice(0, 10) <= ventasFilterHasta);
    filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const paged = paginate(filtered, ventasPage);

    html += '<div class="card"><div class="table-wrapper"><table><thead><tr>';
    html += '<th>N° Factura</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Subtotal</th><th>IVA (19%)</th><th>Total</th><th>Método</th><th>Estado</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';

    if (paged.data.length === 0) {
      html += '<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🧾</div><p>Sin ventas registradas</p></div></td></tr>';
    }

    paged.data.forEach(v => {
      const cl = getCliente(v.clienteId);
      const badgeCls = v.estado === 'Pagado' ? 'badge-green' : v.estado === 'Pendiente' ? 'badge-orange' : 'badge-red';
      html += '<tr>';
      html += '<td class="fw-600">' + esc(v.factura) + '</td>';
      html += '<td>' + fmtDate(v.fecha) + '</td>';
      html += '<td>' + (cl ? esc(cl.nombre) : '—') + '</td>';
      html += '<td>' + v.items.reduce((s, it) => s + it.cantidad, 0) + '</td>';
      html += '<td>' + fmtMoney(v.subtotal) + '</td>';
      html += '<td>' + fmtMoney(v.iva) + '</td>';
      html += '<td class="fw-600">' + fmtMoney(v.total) + '</td>';
      html += '<td>' + esc(v.metodoPago) + '</td>';
      html += '<td><span class="badge ' + badgeCls + '">' + v.estado + '</span></td>';
      html += '<td><div style="display:flex;gap:4px">';
      html += '<button class="btn-icon" data-action="view-venta" data-id="' + v.id + '" title="Ver recibo">🧾</button>';
      if (v.estado !== 'Cancelado') {
        html += '<button class="btn-icon danger" data-action="cancel-venta" data-id="' + v.id + '" title="Cancelar">✕</button>';
      }
      html += '</div></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += renderPagination(paged.totalPages, paged.page);
    html += '</div>';

    $('#ventasContent').innerHTML = html;

    $('#vFDesde').addEventListener('change', function () { ventasFilterDesde = this.value; ventasPage = 1; renderVentasHistorial(); });
    $('#vFHasta').addEventListener('change', function () { ventasFilterHasta = this.value; ventasPage = 1; renderVentasHistorial(); });
    $('#vFEstado').addEventListener('change', function () { ventasFilterEstado = this.value; ventasPage = 1; renderVentasHistorial(); });

    bindPagination($('#ventasContent'), p => { ventasPage = p; renderVentasHistorial(); });

    $$('[data-action]', $('#ventasContent')).forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const id = this.dataset.id;
        if (action === 'view-venta') viewRecibo(id);
        if (action === 'cancel-venta') cancelVenta(id);
      });
    });
  }

  function viewRecibo(ventaId) {
    const v = getData('ventas').find(x => x.id === ventaId);
    if (!v) return;
    const cl = getCliente(v.clienteId);

    let body = '<div class="receipt" id="receiptPrint">';
    body += '<div class="receipt-header"><h2>BETA</h2><p>Sistema de Gestión de Inventarios</p></div>';
    body += '<div class="receipt-row"><span>N° Factura:</span><span>' + esc(v.factura) + '</span></div>';
    body += '<div class="receipt-row"><span>Fecha:</span><span>' + fmtDate(v.fecha) + '</span></div>';
    body += '<div class="receipt-row"><span>Cliente:</span><span>' + (cl ? esc(cl.nombre) : '—') + '</span></div>';
    body += '<div class="receipt-row"><span>Método de Pago:</span><span>' + esc(v.metodoPago) + '</span></div>';
    body += '<div class="receipt-row"><span>Estado:</span><span>' + v.estado + '</span></div>';
    body += '<table class="receipt-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>';
    v.items.forEach(it => {
      body += '<tr><td>' + esc(it.nombre) + '</td><td>' + it.cantidad + '</td><td>' + fmtMoney(it.precio) + '</td><td>' + fmtMoney(it.precio * it.cantidad) + '</td></tr>';
    });
    body += '</tbody></table>';
    body += '<div class="receipt-row"><span>Subtotal:</span><span>' + fmtMoney(v.subtotal) + '</span></div>';
    body += '<div class="receipt-row"><span>IVA (19%):</span><span>' + fmtMoney(v.iva) + '</span></div>';
    if (v.descuento) body += '<div class="receipt-row"><span>Descuento:</span><span>-' + fmtMoney(v.descuento) + '</span></div>';
    body += '<div class="receipt-total">TOTAL: ' + fmtMoney(v.total) + '</div>';
    body += '</div>';

    const footer = '<button class="btn btn-secondary" id="printReceiptBtn">🖨️ Imprimir</button><button class="btn btn-primary" id="modalCancelBtn">Cerrar</button>';
    openModal('Recibo — ' + v.factura, body, footer);
    $('#modalCancelBtn').onclick = closeModal;
    $('#printReceiptBtn').onclick = function () { window.print(); };
  }

  function cancelVenta(ventaId) {
    openModal('Cancelar Venta', '<p>¿Estás seguro de que deseas cancelar esta venta? Esta acción no se puede deshacer.</p>',
      '<button class="btn btn-secondary" id="modalCancelBtn">No, volver</button><button class="btn btn-danger" id="modalConfirmBtn">Sí, cancelar</button>');
    $('#modalCancelBtn').onclick = closeModal;
    $('#modalConfirmBtn').onclick = function () {
      const ventas = getData('ventas');
      const idx = ventas.findIndex(v => v.id === ventaId);
      if (idx !== -1) {
        ventas[idx].estado = 'Cancelado';
        /* Restore stock */
        const prods = getData('productos');
        ventas[idx].items.forEach(it => {
          const pi = prods.findIndex(p => p.id === it.productoId);
          if (pi !== -1) prods[pi].stock += it.cantidad;
        });
        saveData('productos', prods);
        saveData('ventas', ventas);
        toast('Venta cancelada y stock restaurado');
      }
      closeModal();
      renderVentasHistorial();
    };
  }

  /* NUEVA VENTA */
  function renderNuevaVenta() {
    const clientes = getData('clientes');
    const productos = getData('productos').filter(p => p.stock > 0);

    let html = '<div class="grid-2">';

    /* Left panel - form */
    html += '<div class="card"><div class="card-header"><span class="card-title">Datos de la Venta</span></div><div class="card-body">';
    html += '<div class="form-group"><label>Cliente *</label><div style="display:flex;gap:8px"><select class="form-control" id="nvCliente" style="flex:1"><option value="">Seleccionar cliente...</option>';
    clientes.forEach(c => { html += '<option value="' + c.id + '">' + esc(c.nombre) + ' — ' + esc(c.rut) + '</option>'; });
    html += '</select><button class="btn btn-secondary btn-sm" id="nvAddCliente">+ Nuevo</button></div></div>';

    html += '<div class="form-group"><label>Buscar Producto</label><input class="form-control" id="nvProductSearch" placeholder="Escriba para buscar..." autocomplete="off"></div>';
    html += '<div id="nvProductResults" style="position:relative"></div>';

    html += '<div class="form-row">';
    html += '<div class="form-group"><label>Precio Unitario</label><input type="number" class="form-control" id="nvPrecio" readonly></div>';
    html += '<div class="form-group"><label>Cantidad</label><input type="number" class="form-control" id="nvCantidad" min="1" value="1"></div>';
    html += '</div>';
    html += '<input type="hidden" id="nvProductId">';
    html += '<button class="btn btn-primary w-full" id="nvAddToCart">Agregar al Carrito</button>';
    html += '</div></div>';

    /* Right panel - cart */
    html += '<div class="card"><div class="card-header"><span class="card-title">Carrito</span></div><div class="card-body">';
    html += '<div class="table-wrapper"><table><thead><tr><th>Producto</th><th>P. Unit.</th><th>Cant.</th><th>Subtotal</th><th></th></tr></thead><tbody id="nvCartBody">';
    if (cart.length === 0) {
      html += '<tr><td colspan="5" class="text-center text-muted" style="padding:20px">Carrito vacío</td></tr>';
    }
    cart.forEach((it, i) => {
      html += '<tr><td>' + esc(it.nombre) + '</td><td>' + fmtMoney(it.precio) + '</td><td>' + it.cantidad + '</td><td>' + fmtMoney(it.precio * it.cantidad) + '</td><td><button class="btn-icon danger" data-cartidx="' + i + '">✕</button></td></tr>';
    });
    html += '</tbody></table></div>';

    /* Summary */
    const subtotal = cart.reduce((s, it) => s + it.precio * it.cantidad, 0);
    html += '<div class="cart-summary">';
    html += '<div class="cart-summary-row"><span>Subtotal</span><span>' + fmtMoney(subtotal) + '</span></div>';
    html += '<div class="cart-summary-row"><span><label class="form-check"><input type="checkbox" id="nvIvaCheck" checked> IVA (19%)</label></span><span id="nvIvaVal">' + fmtMoney(Math.round(subtotal * 0.19)) + '</span></div>';
    html += '<div class="cart-summary-row"><span>Descuento</span><span><input type="number" class="form-control" id="nvDescuento" value="0" style="width:100px;text-align:right;padding:4px 8px"></span></div>';
    const iva = Math.round(subtotal * 0.19);
    html += '<div class="cart-summary-row total"><span>TOTAL</span><span id="nvTotal">' + fmtMoney(subtotal + iva) + '</span></div>';
    html += '</div>';

    html += '<div class="form-group" style="margin-top:16px"><label>Método de Pago</label><select class="form-control" id="nvMetodo"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div>';
    html += '<button class="btn btn-primary w-full" id="nvGenerar" style="margin-top:8px">Generar Venta</button>';
    html += '</div></div>';

    html += '</div>';

    $('#ventasContent').innerHTML = html;

    /* Product search */
    let selectedProd = null;
    $('#nvProductSearch').addEventListener('input', function () {
      const q = this.value.toLowerCase();
      if (q.length < 2) { $('#nvProductResults').innerHTML = ''; return; }
      const matches = productos.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 5);
      let rhtml = '<div style="position:absolute;top:0;left:0;right:0;background:#fff;border:1px solid var(--border);border-radius:4px;box-shadow:var(--shadow-md);z-index:10">';
      matches.forEach(p => {
        rhtml += '<div style="padding:8px 12px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--border)" class="prod-result" data-id="' + p.id + '">' + esc(p.nombre) + ' <span class="text-muted">(Stock: ' + p.stock + ')</span></div>';
      });
      if (matches.length === 0) rhtml += '<div style="padding:8px 12px;font-size:12px;color:var(--text-secondary)">Sin resultados</div>';
      rhtml += '</div>';
      $('#nvProductResults').innerHTML = rhtml;
      $$('.prod-result', $('#nvProductResults')).forEach(el => {
        el.addEventListener('click', function () {
          const p = getProducto(this.dataset.id);
          if (!p) return;
          selectedProd = p;
          $('#nvProductSearch').value = p.nombre;
          $('#nvPrecio').value = p.precioVenta;
          $('#nvProductId').value = p.id;
          $('#nvCantidad').max = p.stock;
          $('#nvProductResults').innerHTML = '';
        });
      });
    });

    /* Add to cart */
    $('#nvAddToCart').addEventListener('click', function () {
      const prodId = $('#nvProductId').value;
      const cantidad = parseInt($('#nvCantidad').value);
      if (!prodId || !selectedProd) { toast('Selecciona un producto', 'error'); return; }
      if (isNaN(cantidad) || cantidad < 1) { toast('Cantidad inválida', 'error'); return; }
      if (cantidad > selectedProd.stock) { toast('Stock insuficiente (disponible: ' + selectedProd.stock + ')', 'error'); return; }

      const existing = cart.findIndex(c => c.productoId === prodId);
      if (existing !== -1) {
        cart[existing].cantidad += cantidad;
      } else {
        cart.push({ productoId: prodId, nombre: selectedProd.nombre, precio: selectedProd.precioVenta, cantidad });
      }
      selectedProd = null;
      $('#nvProductSearch').value = '';
      $('#nvProductId').value = '';
      $('#nvPrecio').value = '';
      $('#nvCantidad').value = '1';
      renderNuevaVenta();
      toast('Producto agregado al carrito');
    });

    /* Remove from cart */
    $$('[data-cartidx]', $('#ventasContent')).forEach(btn => {
      btn.addEventListener('click', function () {
        cart.splice(parseInt(this.dataset.cartidx), 1);
        renderNuevaVenta();
      });
    });

    /* Update totals */
    function updateTotals() {
      const st = cart.reduce((s, it) => s + it.precio * it.cantidad, 0);
      const applyIva = $('#nvIvaCheck').checked;
      const ivaVal = applyIva ? Math.round(st * 0.19) : 0;
      const desc = parseInt($('#nvDescuento').value) || 0;
      $('#nvIvaVal').textContent = fmtMoney(ivaVal);
      $('#nvTotal').textContent = fmtMoney(st + ivaVal - desc);
    }

    if ($('#nvIvaCheck')) $('#nvIvaCheck').addEventListener('change', updateTotals);
    if ($('#nvDescuento')) $('#nvDescuento').addEventListener('input', updateTotals);

    /* New client quick-add */
    $('#nvAddCliente').addEventListener('click', function () {
      openClienteModal(null, function () {
        renderNuevaVenta();
      });
    });

    /* Generate sale */
    $('#nvGenerar').addEventListener('click', function () {
      const clienteId = $('#nvCliente').value;
      if (!clienteId) { toast('Selecciona un cliente', 'error'); return; }
      if (cart.length === 0) { toast('El carrito está vacío', 'error'); return; }

      const subtotal = cart.reduce((s, it) => s + it.precio * it.cantidad, 0);
      const applyIva = $('#nvIvaCheck').checked;
      const iva = applyIva ? Math.round(subtotal * 0.19) : 0;
      const descuento = parseInt($('#nvDescuento').value) || 0;
      const total = subtotal + iva - descuento;
      const metodoPago = $('#nvMetodo').value;
      const factura = nextFactura();

      const venta = {
        id: uid(),
        factura,
        fecha: new Date().toISOString(),
        clienteId,
        items: cart.map(c => ({ productoId: c.productoId, nombre: c.nombre, precio: c.precio, cantidad: c.cantidad })),
        subtotal,
        iva,
        descuento,
        total,
        metodoPago,
        estado: 'Pagado'
      };

      /* Update stock */
      const prods = getData('productos');
      cart.forEach(c => {
        const pi = prods.findIndex(p => p.id === c.productoId);
        if (pi !== -1) prods[pi].stock = Math.max(0, prods[pi].stock - c.cantidad);
      });
      saveData('productos', prods);

      const ventas = getData('ventas');
      ventas.push(venta);
      saveData('ventas', ventas);

      cart = [];
      toast('Venta generada exitosamente — ' + factura);
      viewRecibo(venta.id);
      ventasTab = 'historial';
      renderVentas();
    });
  }

  /* ----------------------------------------------------------
     PROVEEDORES
     ---------------------------------------------------------- */
  let provView = 'cards';
  let provSearch = '';
  let provPage = 1;

  function renderProveedores() {
    const proveedores = getData('proveedores');
    const productos = getData('productos');

    let html = '<div class="toolbar">';
    html += '<div class="search-box"><input type="text" id="provSearch" placeholder="Buscar proveedor..." value="' + escAttr(provSearch) + '"></div>';
    html += '<div class="view-toggle"><button class="' + (provView === 'cards' ? 'active' : '') + '" data-view="cards" title="Tarjetas">▦</button><button class="' + (provView === 'table' ? 'active' : '') + '" data-view="table" title="Tabla">☰</button></div>';
    html += '<button class="btn btn-primary" id="addProvBtn">+ Agregar Proveedor</button>';
    html += '</div>';

    let filtered = proveedores.slice();
    if (provSearch) {
      const q = provSearch.toLowerCase();
      filtered = filtered.filter(p => p.empresa.toLowerCase().includes(q) || p.contacto.toLowerCase().includes(q));
    }

    if (provView === 'cards') {
      if (filtered.length === 0) {
        html += '<div class="empty-state"><div class="empty-icon">🏢</div><p>No hay proveedores registrados</p><button class="btn btn-primary" onclick="document.getElementById(\'addProvBtn\').click()">+ Agregar Proveedor</button></div>';
      } else {
        html += '<div class="supplier-grid">';
        filtered.forEach(p => {
          const linkedCount = productos.filter(pr => pr.proveedor === p.id).length;
          html += '<div class="supplier-card">';
          html += '<div class="supplier-card-header"><span class="supplier-card-name">' + esc(p.empresa) + '</span>';
          html += '<div class="supplier-card-actions"><button class="btn-icon" data-action="edit-prov" data-id="' + p.id + '">✏️</button><button class="btn-icon danger" data-action="delete-prov" data-id="' + p.id + '">🗑️</button></div></div>';
          html += '<div class="supplier-card-detail">👤 ' + esc(p.contacto) + '</div>';
          html += '<div class="supplier-card-detail">📞 ' + esc(p.telefono) + '</div>';
          html += '<div class="supplier-card-detail">✉️ ' + esc(p.email) + '</div>';
          html += '<div class="supplier-card-detail">📍 ' + esc(p.ciudad) + '</div>';
          html += '<div class="supplier-card-detail">📂 ' + esc(p.categorias) + '</div>';
          if (p.notas) html += '<div class="supplier-card-detail">📝 ' + esc(p.notas) + '</div>';
          html += '<div class="supplier-card-badge">📦 ' + linkedCount + ' producto(s) vinculado(s)</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    } else {
      const paged = paginate(filtered, provPage);
      html += '<div class="card"><div class="table-wrapper"><table><thead><tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Ciudad</th><th>Categorías</th><th>Productos</th><th>Acciones</th></tr></thead><tbody>';
      if (paged.data.length === 0) {
        html += '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏢</div><p>Sin proveedores</p></div></td></tr>';
      }
      paged.data.forEach(p => {
        const linkedCount = productos.filter(pr => pr.proveedor === p.id).length;
        html += '<tr>';
        html += '<td class="fw-600">' + esc(p.empresa) + '</td>';
        html += '<td>' + esc(p.contacto) + '</td>';
        html += '<td>' + esc(p.telefono) + '</td>';
        html += '<td>' + esc(p.email) + '</td>';
        html += '<td>' + esc(p.ciudad) + '</td>';
        html += '<td>' + esc(p.categorias) + '</td>';
        html += '<td><span class="badge badge-blue">' + linkedCount + '</span></td>';
        html += '<td><div style="display:flex;gap:4px"><button class="btn-icon" data-action="edit-prov" data-id="' + p.id + '">✏️</button><button class="btn-icon danger" data-action="delete-prov" data-id="' + p.id + '">🗑️</button></div></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      html += renderPagination(paged.totalPages, paged.page);
      html += '</div>';
    }

    $('#contentArea').innerHTML = html;

    $('#provSearch').addEventListener('input', function () { provSearch = this.value; renderProveedores(); });
    $$('.view-toggle button', $('#contentArea')).forEach(btn => {
      btn.addEventListener('click', function () { provView = this.dataset.view; renderProveedores(); });
    });
    $('#addProvBtn').addEventListener('click', () => openProveedorModal());

    if (provView === 'table') {
      bindPagination($('#contentArea'), p => { provPage = p; renderProveedores(); });
    }

    $$('[data-action]', $('#contentArea')).forEach(btn => {
      btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const id = this.dataset.id;
        if (action === 'edit-prov') openProveedorModal(id);
        if (action === 'delete-prov') confirmDelete('proveedor', id);
      });
    });
  }

  function openProveedorModal(editId) {
    const isEdit = !!editId;
    const prov = isEdit ? getProveedor(editId) : {};

    let body = '<div class="form-row">';
    body += '<div class="form-group"><label>Nombre de la Empresa *</label><input class="form-control" id="fProvEmpresa" value="' + escAttr(prov.empresa || '') + '"></div>';
    body += '<div class="form-group"><label>Persona de Contacto *</label><input class="form-control" id="fProvContacto" value="' + escAttr(prov.contacto || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Teléfono</label><input class="form-control" id="fProvTel" value="' + escAttr(prov.telefono || '') + '"></div>';
    body += '<div class="form-group"><label>Correo Electrónico</label><input type="email" class="form-control" id="fProvEmail" value="' + escAttr(prov.email || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Ciudad</label><input class="form-control" id="fProvCiudad" value="' + escAttr(prov.ciudad || '') + '"></div>';
    body += '<div class="form-group"><label>Categoría de Productos</label><input class="form-control" id="fProvCat" value="' + escAttr(prov.categorias || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-group"><label>Notas</label><textarea class="form-control" id="fProvNotas">' + esc(prov.notas || '') + '</textarea></div>';

    const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">' + (isEdit ? 'Guardar' : 'Agregar') + '</button>';
    openModal(isEdit ? 'Editar Proveedor' : 'Agregar Proveedor', body, footer);

    $('#modalCancelBtn').onclick = closeModal;
    $('#modalSaveBtn').onclick = function () {
      const empresa = $('#fProvEmpresa').value.trim();
      const contacto = $('#fProvContacto').value.trim();
      if (!empresa || !contacto) { toast('Completa los campos obligatorios', 'error'); return; }

      const provs = getData('proveedores');
      const obj = {
        id: isEdit ? editId : uid(),
        empresa,
        contacto,
        telefono: $('#fProvTel').value.trim(),
        email: $('#fProvEmail').value.trim(),
        ciudad: $('#fProvCiudad').value.trim(),
        categorias: $('#fProvCat').value.trim(),
        notas: $('#fProvNotas').value.trim(),
        fecha: isEdit ? (prov.fecha || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10)
      };

      if (isEdit) {
        const idx = provs.findIndex(p => p.id === editId);
        if (idx !== -1) provs[idx] = obj;
      } else {
        provs.push(obj);
      }
      saveData('proveedores', provs);
      toast(isEdit ? 'Proveedor actualizado' : 'Proveedor agregado');
      closeModal();
      renderProveedores();
    };
  }

  /* ----------------------------------------------------------
     CLIENTES
     ---------------------------------------------------------- */
  let cliPage = 1;
  let cliSearch = '';

  function renderClientes() {
    const clientes = getData('clientes');
    const ventas = getData('ventas');

    let html = '<div class="toolbar">';
    html += '<div class="search-box"><input type="text" id="cliSearch" placeholder="Buscar cliente..." value="' + escAttr(cliSearch) + '"></div>';
    if (currentUser.rol !== 'vendedor') {
      html += '<button class="btn btn-primary" id="addCliBtn">+ Agregar Cliente</button>';
    }
    html += '</div>';

    let filtered = clientes.slice();
    if (cliSearch) {
      const q = cliSearch.toLowerCase();
      filtered = filtered.filter(c => c.nombre.toLowerCase().includes(q) || c.rut.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }

    const paged = paginate(filtered, cliPage);

    html += '<div class="card"><div class="table-wrapper"><table><thead><tr>';
    html += '<th>Nombre</th><th>RUT/Cédula</th><th>Correo</th><th>Teléfono</th><th>Ciudad</th><th>N° Compras</th><th>Total Gastado</th><th>Última Compra</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';

    if (paged.data.length === 0) {
      html += '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">👥</div><p>Sin clientes registrados</p><button class="btn btn-primary" onclick="document.getElementById(\'addCliBtn\').click()">+ Agregar Cliente</button></div></td></tr>';
    }

    paged.data.forEach(c => {
      const cVentas = ventas.filter(v => v.clienteId === c.id && v.estado !== 'Cancelado');
      const totalGastado = cVentas.reduce((s, v) => s + v.total, 0);
      const ultimaCompra = cVentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
      html += '<tr>';
      html += '<td class="fw-600" style="cursor:pointer;color:var(--primary)" data-action="view-cliente" data-id="' + c.id + '">' + esc(c.nombre) + '</td>';
      html += '<td>' + esc(c.rut) + '</td>';
      html += '<td>' + esc(c.email) + '</td>';
      html += '<td>' + esc(c.telefono) + '</td>';
      html += '<td>' + esc(c.ciudad) + '</td>';
      html += '<td>' + cVentas.length + '</td>';
      html += '<td>' + fmtMoney(totalGastado) + '</td>';
      html += '<td>' + (ultimaCompra ? fmtDate(ultimaCompra.fecha) : '—') + '</td>';
      if (currentUser.rol !== 'vendedor') {
        html += '<td><div style="display:flex;gap:4px"><button class="btn-icon" data-action="edit-cliente" data-id="' + c.id + '">✏️</button><button class="btn-icon danger" data-action="delete-cliente" data-id="' + c.id + '">🗑️</button></div></td>';
      } else {
        html += '<td><span class="text-muted fs-11">Solo lectura</span></td>';
      }
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += renderPagination(paged.totalPages, paged.page);
    html += '</div>';

    $('#contentArea').innerHTML = html;

    $('#cliSearch').addEventListener('input', function () { cliSearch = this.value; cliPage = 1; renderClientes(); });
    $('#addCliBtn').addEventListener('click', () => openClienteModal());

    bindPagination($('#contentArea'), p => { cliPage = p; renderClientes(); });

    $$('[data-action]', $('#contentArea')).forEach(el => {
      el.addEventListener('click', function () {
        const action = this.dataset.action;
        const id = this.dataset.id;
        if (action === 'edit-cliente') openClienteModal(id);
        if (action === 'delete-cliente') confirmDelete('cliente', id);
        if (action === 'view-cliente') viewClienteHistory(id);
      });
    });
  }

  function openClienteModal(editId, callback) {
    const isEdit = !!editId;
    const cli = isEdit ? getCliente(editId) : {};

    let body = '<div class="form-row">';
    body += '<div class="form-group"><label>Nombre Completo *</label><input class="form-control" id="fCliNombre" value="' + escAttr(cli.nombre || '') + '"></div>';
    body += '<div class="form-group"><label>RUT/Cédula *</label><input class="form-control" id="fCliRut" value="' + escAttr(cli.rut || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Correo Electrónico</label><input type="email" class="form-control" id="fCliEmail" value="' + escAttr(cli.email || '') + '"></div>';
    body += '<div class="form-group"><label>Teléfono</label><input class="form-control" id="fCliTel" value="' + escAttr(cli.telefono || '') + '"></div>';
    body += '</div>';
    body += '<div class="form-group"><label>Ciudad</label><input class="form-control" id="fCliCiudad" value="' + escAttr(cli.ciudad || '') + '"></div>';

    const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">' + (isEdit ? 'Guardar' : 'Agregar') + '</button>';
    openModal(isEdit ? 'Editar Cliente' : 'Agregar Cliente', body, footer);

    $('#modalCancelBtn').onclick = closeModal;
    $('#modalSaveBtn').onclick = function () {
      const nombre = $('#fCliNombre').value.trim();
      const rut = $('#fCliRut').value.trim();
      if (!nombre || !rut) { toast('Completa los campos obligatorios', 'error'); return; }

      const clients = getData('clientes');
      const obj = {
        id: isEdit ? editId : uid(),
        nombre,
        rut,
        email: $('#fCliEmail').value.trim(),
        telefono: $('#fCliTel').value.trim(),
        ciudad: $('#fCliCiudad').value.trim()
      };

      if (isEdit) {
        const idx = clients.findIndex(c => c.id === editId);
        if (idx !== -1) clients[idx] = obj;
      } else {
        clients.push(obj);
      }
      saveData('clientes', clients);
      toast(isEdit ? 'Cliente actualizado' : 'Cliente agregado');
      closeModal();
      if (callback) callback();
      else renderClientes();
    };
  }

  function viewClienteHistory(clienteId) {
    const cli = getCliente(clienteId);
    if (!cli) return;
    const ventas = getData('ventas').filter(v => v.clienteId === clienteId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let body = '<div style="margin-bottom:16px">';
    body += '<p><strong>RUT:</strong> ' + esc(cli.rut) + '</p>';
    body += '<p><strong>Email:</strong> ' + esc(cli.email) + '</p>';
    body += '<p><strong>Teléfono:</strong> ' + esc(cli.telefono) + '</p>';
    body += '<p><strong>Ciudad:</strong> ' + esc(cli.ciudad) + '</p>';
    body += '</div>';
    body += '<h3 style="font-size:14px;margin-bottom:10px">Historial de Compras (' + ventas.length + ')</h3>';

    if (ventas.length === 0) {
      body += '<p class="text-muted">Este cliente no tiene compras registradas.</p>';
    } else {
      body += '<table><thead><tr><th>Factura</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>';
      ventas.forEach(v => {
        const badgeCls = v.estado === 'Pagado' ? 'badge-green' : v.estado === 'Pendiente' ? 'badge-orange' : 'badge-red';
        body += '<tr><td>' + esc(v.factura) + '</td><td>' + fmtDate(v.fecha) + '</td><td>' + fmtMoney(v.total) + '</td><td><span class="badge ' + badgeCls + '">' + v.estado + '</span></td></tr>';
      });
      body += '</tbody></table>';
    }

    openModal('Cliente — ' + cli.nombre, body, '<button class="btn btn-primary" id="modalCancelBtn">Cerrar</button>');
    $('#modalCancelBtn').onclick = closeModal;
  }

  /* ----------------------------------------------------------
     GUÍAS DE DESPACHO
     ---------------------------------------------------------- */
  let guiaPage = 1;
  let guiaFilterEstado = '';

  function renderDespacho() {
    const guias = getData('guias');
    const ventas = getData('ventas');

    let html = '<div class="toolbar">';
    html += '<select id="guiaFilterEstado"><option value="">Todos los Estados</option><option value="En Bodega" ' + (guiaFilterEstado === 'En Bodega' ? 'selected' : '') + '>En Bodega</option><option value="En Despacho" ' + (guiaFilterEstado === 'En Despacho' ? 'selected' : '') + '>En Despacho</option><option value="Entregado" ' + (guiaFilterEstado === 'Entregado' ? 'selected' : '') + '>Entregado</option><option value="Cancelado" ' + (guiaFilterEstado === 'Cancelado' ? 'selected' : '') + '>Cancelado</option></select>';
    html += '<button class="btn btn-primary" id="addGuiaBtn">+ Agregar Guía</button>';
    html += '</div>';

    let filtered = guias.slice();
    if (guiaFilterEstado) filtered = filtered.filter(g => g.estado === guiaFilterEstado);

    const paged = paginate(filtered, guiaPage);

    html += '<div class="card"><div class="table-wrapper"><table><thead><tr>';
    html += '<th>N° Guía</th><th>Factura</th><th>Cliente</th><th>Dirección</th><th>Transportista</th><th>Seguimiento</th><th>Estado</th><th>Actualización</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';

    if (paged.data.length === 0) {
      html += '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🚚</div><p>No hay guías de despacho</p><button class="btn btn-primary" onclick="document.getElementById(\'addGuiaBtn\').click()">+ Agregar Guía</button></div></td></tr>';
    }

    paged.data.forEach(g => {
      const cli = getCliente(g.clienteId);
      html += '<tr>';
      html += '<td class="fw-600">' + esc(g.numero) + '</td>';
      html += '<td>' + esc(g.factura) + '</td>';
      html += '<td>' + (cli ? esc(cli.nombre) : '—') + '</td>';
      html += '<td>' + esc(g.direccion) + '</td>';
      html += '<td>' + esc(g.transportista) + '</td>';
      html += '<td class="fs-11">' + esc(g.seguimiento) + '</td>';
      html += '<td>' + renderPipeline(g.estado) + '</td>';
      html += '<td>' + fmtDate(g.actualizado) + '</td>';
      html += '<td><div style="display:flex;gap:4px">';
      html += '<select class="form-control" style="width:auto;padding:4px 24px 4px 8px;font-size:11px" data-action="change-guia-estado" data-id="' + g.id + '">';
      ['En Bodega', 'En Despacho', 'Entregado', 'Cancelado'].forEach(est => {
        html += '<option value="' + est + '" ' + (g.estado === est ? 'selected' : '') + '>' + est + '</option>';
      });
      html += '</select>';
      html += '<button class="btn-icon danger" data-action="delete-guia" data-id="' + g.id + '" title="Eliminar">🗑️</button>';
      html += '</div></td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += renderPagination(paged.totalPages, paged.page);
    html += '</div>';

    $('#contentArea').innerHTML = html;

    $('#guiaFilterEstado').addEventListener('change', function () { guiaFilterEstado = this.value; guiaPage = 1; renderDespacho(); });
    $('#addGuiaBtn').addEventListener('click', () => openGuiaModal());

    bindPagination($('#contentArea'), p => { guiaPage = p; renderDespacho(); });

    $$('[data-action="change-guia-estado"]', $('#contentArea')).forEach(sel => {
      sel.addEventListener('change', function () {
        const guiasData = getData('guias');
        const idx = guiasData.findIndex(g => g.id === this.dataset.id);
        if (idx !== -1) {
          guiasData[idx].estado = this.value;
          guiasData[idx].actualizado = new Date().toISOString();
          saveData('guias', guiasData);
          toast('Estado actualizado a: ' + this.value);
          renderDespacho();
        }
      });
    });

    $$('[data-action="delete-guia"]', $('#contentArea')).forEach(btn => {
      btn.addEventListener('click', function () {
        confirmDelete('guía', this.dataset.id);
      });
    });
  }

  function renderPipeline(estado) {
    const steps = [
      { label: '🏬 Bodega', key: 'En Bodega' },
      { label: '🚚 Despacho', key: 'En Despacho' },
      { label: '✅ Entregado', key: 'Entregado' }
    ];

    if (estado === 'Cancelado') {
      return '<span class="badge badge-red">❌ Cancelado</span>';
    }

    const activeIdx = steps.findIndex(s => s.key === estado);
    let html = '<div class="pipeline">';
    steps.forEach((s, i) => {
      if (i > 0) html += '<span class="pipeline-arrow">→</span>';
      html += '<span class="pipeline-step ' + (i <= activeIdx ? 'active' : '') + '">' + s.label + '</span>';
    });
    html += '</div>';
    return html;
  }

  function openGuiaModal() {
    const ventas = getData('ventas').filter(v => v.estado !== 'Cancelado');

    let body = '<div class="form-group"><label>Venta Asociada *</label><select class="form-control" id="fGuiaVenta"><option value="">Seleccionar venta...</option>';
    ventas.forEach(v => {
      const cli = getCliente(v.clienteId);
      body += '<option value="' + v.id + '">' + esc(v.factura) + ' — ' + (cli ? esc(cli.nombre) : '—') + ' — ' + fmtMoney(v.total) + '</option>';
    });
    body += '</select></div>';
    body += '<div class="form-group"><label>Dirección de Envío *</label><input class="form-control" id="fGuiaDir"></div>';
    body += '<div class="form-row">';
    body += '<div class="form-group"><label>Transportista *</label><input class="form-control" id="fGuiaTrans"></div>';
    body += '<div class="form-group"><label>N° de Seguimiento</label><input class="form-control" id="fGuiaSeg"></div>';
    body += '</div>';

    const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Crear Guía</button>';
    openModal('Agregar Guía de Despacho', body, footer);

    $('#modalCancelBtn').onclick = closeModal;
    $('#modalSaveBtn').onclick = function () {
      const ventaId = $('#fGuiaVenta').value;
      const direccion = $('#fGuiaDir').value.trim();
      const transportista = $('#fGuiaTrans').value.trim();
      if (!ventaId || !direccion || !transportista) { toast('Completa los campos obligatorios', 'error'); return; }

      const venta = getData('ventas').find(v => v.id === ventaId);
      if (!venta) { toast('Venta no encontrada', 'error'); return; }

      const guia = {
        id: uid(),
        numero: nextGuia(),
        ventaId,
        factura: venta.factura,
        clienteId: venta.clienteId,
        direccion,
        transportista,
        seguimiento: $('#fGuiaSeg').value.trim(),
        estado: 'En Bodega',
        actualizado: new Date().toISOString()
      };

      const guias = getData('guias');
      guias.push(guia);
      saveData('guias', guias);
      toast('Guía ' + guia.numero + ' creada');
      closeModal();
      renderDespacho();
    };
  }

  /* ----------------------------------------------------------
     CONFIRMAR ELIMINACIÓN (GENÉRICA)
     ---------------------------------------------------------- */
  function confirmDelete(entity, id) {
    openModal('Confirmar Eliminación',
      '<p>¿Estás seguro de que deseas eliminar este/a <strong>' + entity + '</strong>?</p><p class="text-muted" style="margin-top:8px">Esta acción no se puede deshacer.</p>',
      '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-danger" id="modalConfirmBtn">Eliminar</button>');

    $('#modalCancelBtn').onclick = closeModal;
    $('#modalConfirmBtn').onclick = function () {
      let key, renderFn;
      if (entity === 'producto') { key = 'productos'; renderFn = renderInventario; }
      else if (entity === 'proveedor') { key = 'proveedores'; renderFn = renderProveedores; }
      else if (entity === 'cliente') { key = 'clientes'; renderFn = renderClientes; }
      else if (entity === 'guía') { key = 'guias'; renderFn = renderDespacho; }

      if (key) {
        const data = getData(key);
        const idx = data.findIndex(d => d.id === id);
        if (idx !== -1) data.splice(idx, 1);
        saveData(key, data);
        toast(entity.charAt(0).toUpperCase() + entity.slice(1) + ' eliminado/a');
      }
      closeModal();
      if (renderFn) renderFn();
    };
  }

  /* ----------------------------------------------------------
     HTML ESCAPE
     ---------------------------------------------------------- */
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return esc(str);
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  seedData();
  renderModule();

  /* Notification bell click */
  $('#notifBtn').addEventListener('click', function () {
    currentModule = 'inventario';
    invFilterDisp = 'bajo';
    navItems.forEach(n => n.classList.remove('active'));
    $$('[data-module="inventario"]').forEach(n => n.classList.add('active'));
    renderModule();
  });

  /* ----------------------------------------------------------
     NEGOCIOS (SUPER ADMIN)
     ---------------------------------------------------------- */
  function renderNegocios() {
    $('#pageTitle').textContent = 'Gestión de Negocios';
    const negocios = getData('negocios');
    let html = '<div class="toolbar"><button class="btn btn-primary" id="addNegocioBtn">+ Agregar Negocio</button></div>';
    html += '<div class="card"><div class="table-wrapper"><table><thead><tr><th>Nombre Negocio</th><th>ID</th></tr></thead><tbody>';
    if(negocios.length === 0) {
      html += '<tr><td colspan="2"><div class="empty-state"><p>No hay negocios registrados</p></div></td></tr>';
    }
    negocios.forEach(n => {
      html += '<tr><td class="fw-600">' + esc(n.nombre) + '</td><td class="text-muted">' + n.id + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
    $('#contentArea').innerHTML = html;
    
    if ($('#addNegocioBtn')) {
      $('#addNegocioBtn').addEventListener('click', function() {
         openModal('Nuevo Negocio', '<div class="form-group"><label>Nombre del Negocio</label><input class="form-control" id="fNegocioNombre"></div>', '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Crear</button>');
         $('#modalCancelBtn').onclick = closeModal;
         $('#modalSaveBtn').onclick = function() {
            const nombre = $('#fNegocioNombre').value.trim();
            if(!nombre) { toast('Nombre vacío', 'error'); return; }
            const neg = getData('negocios');
            neg.push({id: uid(), nombre});
            saveData('negocios', neg);
            toast('Negocio creado');
            closeModal();
            renderNegocios();
         };
      });
    }
  }

  /* ----------------------------------------------------------
     USUARIOS
     ---------------------------------------------------------- */
  function renderUsuarios() {
    $('#pageTitle').textContent = 'Gestión de Usuarios';
    const usuarios = getData('usuarios').filter(u => u.rol !== 'superAdmin');
    let html = '<div class="toolbar"><button class="btn btn-primary" id="addUsuarioBtn">+ Agregar Usuario</button></div>';
    html += '<div class="card"><div class="table-wrapper"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Negocio</th></tr></thead><tbody>';
    if(usuarios.length === 0) {
      html += '<tr><td colspan="3"><div class="empty-state"><p>No hay usuarios registrados</p></div></td></tr>';
    }
    const negocios = getData('negocios');
    usuarios.forEach(u => {
      const n = negocios.find(x => x.id === u.negocio);
      html += '<tr><td class="fw-600">' + esc(u.usuario) + '</td><td><span class="badge badge-blue">' + u.rol + '</span></td><td>' + (n ? esc(n.nombre) : '—') + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
    $('#contentArea').innerHTML = html;
    
    if ($('#addUsuarioBtn')) {
      $('#addUsuarioBtn').addEventListener('click', function() {
         let body = '<div class="form-group"><label>Username</label><input class="form-control" id="fUser"></div>';
         body += '<div class="form-group"><label>Contraseña</label><input type="password" class="form-control" id="fPass"></div>';
         body += '<div class="form-group"><label>Rol</label><select class="form-control" id="fRol">';
         
         if (currentUser.rol === 'superAdmin') {
           body += '<option value="admin">Administrador</option>';
         } else {
           body += '<option value="bodeguero">Bodeguero</option><option value="vendedor">Vendedor</option>';
         }
         body += '</select></div>';
         
         if (currentUser.rol === 'superAdmin') {
            body += '<div class="form-group"><label>Negocio</label><select class="form-control" id="fNegocio"><option value="">-- Seleccionar --</option>';
            getData('negocios').forEach(n => {
              body += '<option value="' + n.id + '">' + esc(n.nombre) + '</option>';
            });
            body += '</select></div>';
         }

         openModal('Nuevo Usuario', body, '<button class="btn btn-secondary" id="modalCancelBtn">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Crear</button>');
         $('#modalCancelBtn').onclick = closeModal;
         $('#modalSaveBtn').onclick = function() {
            const usuario = $('#fUser').value.trim();
            const pass = $('#fPass').value.trim();
            const rol = $('#fRol').value;
            const negocio = currentUser.rol === 'superAdmin' ? ( $('#fNegocio') ? $('#fNegocio').value : '' ) : currentUser.negocio;
            
            if(!usuario || !pass || (currentUser.rol === 'superAdmin' && !negocio)) {
              toast('Completa los campos', 'error'); return;
            }
            
            const users = getData('usuarios');
            if (users.find(u => u.usuario === usuario)) {
               toast('El usuario ya existe', 'error'); return;
            }
            users.push({id: uid(), usuario, pass, rol, negocio});
            saveData('usuarios', users);
            toast('Usuario creado');
            closeModal();
            renderUsuarios();
         };
      });
    }
  }

  /* Window resize to redraw chart */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (currentModule === 'dashboard') {
        const filter = $('#chartFilter');
        if (filter) drawChart(filter.value);
      }
    }, 250);
  });

})();
