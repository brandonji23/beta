(function () {
  'use strict';

  const LS = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  };

  // Ensure superAdmin exists
  function ensureSuperAdmin() {
    let usuarios = LS.get('usuarios') || [];
    if (!usuarios.find(u => u.rol === 'superAdmin')) {
      usuarios.push({ id: 'sa_' + Date.now(), usuario: 'prueba', pass: 'contraseñaprueba', rol: 'superAdmin', negocio: null });
      LS.set('usuarios', usuarios);
    }
  }

  ensureSuperAdmin(); // create SA if it doesn't exist

  // If already logged in, redirect to index
  if (LS.get('currentUser')) {
    window.location.href = 'index.html';
  }

  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value.trim();

    const usuarios = LS.get('usuarios') || [];
    const validUser = usuarios.find(u => u.usuario === userVal && u.pass === passVal);

    if (validUser) {
      // Create session
      LS.set('currentUser', {
        id: validUser.id,
        usuario: validUser.usuario,
        rol: validUser.rol,
        negocio: validUser.negocio
      });
      window.location.href = 'index.html';
    } else {
      loginError.classList.remove('hidden');
    }
  });

})();
