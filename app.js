/* ══════════════════════════════════════
   LINKUP — app.js
   Lógica completa: Auth, Feed, Perfil,
   Búsqueda, Mensajes, Notificaciones, Empleo
══════════════════════════════════════ */

'use strict';

// ── ESTADO GLOBAL ──────────────────────────────────────
const STATE = {
  currentUser: null,
  currentPage: 'feed',
  activeContact: 1,
  unreadNotifCount: 3,
  empTab: 'available',
};

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';
const AUTH_TOKEN_KEY = 'linkup_auth_token';

// Colores de avatar
const AVATAR_COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DC2626','#0891B2','#9333EA','#065F46'];
const avatarColor = (str) => AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length];

// ── DATOS DE EJEMPLO ───────────────────────────────────
const DEMO_CREDENTIALS = { email: 'demo@linkup.co', password: '123456' };

const USERS = [
  { id: 1, name: 'Carlos Rodríguez',   initials: 'CR', role: 'CEO en StartupLab',           color: '#2563EB', following: false, online: true },
  { id: 2, name: 'Ana Chen',            initials: 'AC', role: 'Diseñadora UX/UI en CreativeHub', color: '#059669', following: true,  online: true },
  { id: 3, name: 'Roberto Martínez',   initials: 'RM', role: 'Product Manager',              color: '#D97706', following: false, online: false },
  { id: 4, name: 'Laura Sánchez',      initials: 'LS', role: 'Data Scientist en AI Corp',   color: '#DC2626', following: false, online: false },
  { id: 5, name: 'Diego López',        initials: 'DL', role: 'Full Stack Developer',         color: '#0891B2', following: true,  online: true  },
  { id: 6, name: 'Sofía Torres',       initials: 'ST', role: 'Marketing Manager',            color: '#9333EA', following: false, online: false },
];

const SEARCH_AVATARS = {
  1: 'https://randomuser.me/api/portraits/men/32.jpg',
  2: 'https://randomuser.me/api/portraits/women/44.jpg',
  3: 'https://randomuser.me/api/portraits/men/46.jpg',
  4: 'https://randomuser.me/api/portraits/women/65.jpg',
  5: 'https://randomuser.me/api/portraits/men/33.jpg',
  6: 'https://randomuser.me/api/portraits/women/68.jpg',
};

let POSTS = [
  {
    id: 1,
    user: { name: 'María González', initials: 'MG', color: '#059669', role: 'Desarrolladora Senior en TechCorp' },
    content: 'Emocionada de compartir que acabo de completar mi certificación en Cloud Computing. Gracias a todos los que me apoyaron en este viaje de aprendizaje.',
    time: 'Hace 2 horas',
    likes: 124, comments: 18, liked: false,
  },
  {
    id: 2,
    user: { name: 'Carlos Rodríguez', initials: 'CR', color: '#2563EB', role: 'CEO en StartupLab' },
    content: 'Estamos buscando talento increíble para unirnos a nuestro equipo. Si eres apasionado por la innovación y quieres hacer un impacto real, ¡contáctame!',
    time: 'Hace 4 horas',
    likes: 87, comments: 34, liked: false,
  },
  {
    id: 3,
    user: { name: 'Ana Chen', initials: 'AC', color: '#D97706', role: 'Diseñadora UX/UI' },
    content: 'Principio de diseño del día: menos es más. Un buen diseño no necesita explicación. La claridad supera a la complejidad siempre.',
    time: 'Hace 6 horas',
    likes: 203, comments: 45, liked: true,
  },
];

let NOTIFICATIONS = [
  { id: 1, type: 'like',    icon: '❤️', iconClass: 'like',    userInitials: 'CR', userColor: '#2563EB', avatarImg: 'https://randomuser.me/api/portraits/men/32.jpg', text: '<strong>Carlos Rodríguez</strong> le gusta tu publicación',         time: 'Hace 5 minutos',  unread: true  },
  { id: 2, type: 'follow',  icon: '👤', iconClass: 'follow',  userInitials: 'AC', userColor: '#059669', avatarImg: 'https://randomuser.me/api/portraits/women/44.jpg', text: '<strong>Ana Chen</strong> comenzó a seguirte',                       time: 'Hace 1 hora',     unread: true  },
  { id: 3, type: 'msg',     icon: '💬', iconClass: 'msg',     userInitials: 'RM', userColor: '#D97706', avatarImg: 'https://randomuser.me/api/portraits/men/46.jpg', text: '<strong>Roberto Martínez</strong> te envió un mensaje',               time: 'Hace 2 horas',    unread: true  },
  { id: 4, type: 'comment', icon: '💬', iconClass: 'comment', userInitials: 'LS', userColor: '#DC2626', avatarImg: 'https://randomuser.me/api/portraits/women/65.jpg', text: '<strong>Laura Sánchez</strong> comentó en tu publicación: "¡Felicidades por el logro!"', time: 'Hace 3 horas', unread: false },
  { id: 5, type: 'job',     icon: '💼', iconClass: 'job',     userInitials: 'TC', userColor: '#7C3AED', avatarImg: '', text: '<strong>TechCorp</strong> publicó una nueva oferta de trabajo que podría interesarte', time: 'Hace 1 día', unread: false },
  { id: 6, type: 'like',    icon: '❤️', iconClass: 'like',    userInitials: 'DL', userColor: '#0891B2', avatarImg: 'https://randomuser.me/api/portraits/men/33.jpg', text: '<strong>Diego López</strong> y 12 personas más reaccionaron a tu publicación', time: 'Hace 2 días', unread: false },
];

let JOBS = [
  {
    id: 1, emoji: '',
    title: 'Desarrollador Full Stack Senior', company: 'TechCorp',
    location: 'Madrid, España', type: 'Tiempo completo', salary: '€50,000 - €70,000',
    desc: 'Buscamos un desarrollador Full Stack con experiencia en React, Node.js y bases de datos relacionales. Trabajarás en proyectos innovadores con un equipo dinámico.',
    date: 'Hace 2 días', applied: false,
    logo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 2, emoji: '',
    title: 'Product Manager', company: 'StartupLab',
    location: 'Valencia, España', type: 'Híbrido', salary: '€55,000 - €75,000',
    desc: 'Lidera el desarrollo de productos innovadores en una startup en crecimiento. Experiencia previa en productos tecnológicos es esencial.',
    date: 'Hace 3 días', applied: false,
    logo: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 3, emoji: '',
    title: 'Data Scientist', company: 'AI Corp',
    location: 'Madrid, España', type: 'Tiempo completo', salary: '€60,000 - €80,000',
    desc: 'Trabaja con grandes volúmenes de datos y machine learning. Se requiere experiencia con Python, TensorFlow y análisis estadístico.',
    date: 'Hace 5 días', applied: false,
    logo: 'https://randomuser.me/api/portraits/women/62.jpg',
  },
];

let CONVERSATIONS = {
  1: {
    messages: [
      { mine: false, text: 'Hola, ¿cómo estás?',                             time: '10:00 AM' },
      { mine: true,  text: '¡Hola Carlos! Todo bien, gracias. ¿Y tú?',       time: '10:05 AM' },
      { mine: false, text: 'Muy bien. Te quería comentar sobre el proyecto.', time: '10:10 AM' },
      { mine: true,  text: 'Claro, cuéntame más detalles.',                   time: '10:15 AM' },
      { mine: false, text: '¿Viste mi última publicación?',                   time: '10:30 AM' },
    ],
  },
  2: { messages: [{ mine: false, text: 'Perfecto, hablamos mañana entonces', time: 'Ayer' }] },
  3: { messages: [{ mine: false, text: '¡Gracias por la información!',        time: 'Hace 2 días' }] },
  4: { messages: [] },
  5: { messages: [{ mine: true,  text: '¿Podemos hablar del proyecto?',       time: 'Hace 3 días' }] },
};

const AUTO_REPLIES = [
  'Interesante, cuéntame más.',
  'Entendido, gracias.',
  'Claro, te confirmo pronto.',
  'Perfecto, lo revisamos mañana.',
  'Suena bien',
  'De acuerdo, hablamos.',
];

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
function showLogin(e) {
  e && e.preventDefault();
  hide('register-form'); hide('forgot-form');
  show('login-form');
}
function showRegister(e) {
  e && e.preventDefault();
  hide('login-form'); hide('forgot-form');
  show('register-form');
}
function showForgot(e) {
  e && e.preventDefault();
  hide('login-form'); hide('register-form');
  show('forgot-form');
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers.Authorization = 'Bearer ' + token;

  const response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error de servidor');
  }
  return data;
}

function applyAuthenticatedUser(user, token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  STATE.currentUser = user;
  enterApp();
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function bootstrapSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return;

  try {
    const data = await apiRequest('/me');
    applyAuthenticatedUser(data.user);
  } catch (error) {
    clearAuthSession();
  }
}

async function loadPostsFromApi() {
  try {
    const data = await apiRequest('/posts', { method: 'GET' });
    if (data && Array.isArray(data.posts) && data.posts.length > 0) {
      POSTS = data.posts;
      renderPosts();
    }
  } catch (error) {
    // Mantener los datos locales si el API no responde.
  }
}

async function loadNotificationsFromApi() {
  try {
    const data = await apiRequest('/notifications', { method: 'GET' });
    if (data && Array.isArray(data.notifications) && data.notifications.length > 0) {
      NOTIFICATIONS = data.notifications.map(n => ({
        id: n.id,
        type: n.type,
        icon: '',
        iconClass: n.type,
        text: n.text,
        time: n.time,
        unread: !!n.unread,
        userInitials: '',
      }));
      renderNotifications();
    }
  } catch (error) {
    // Mantener los datos locales si el API no responde.
  }
}

async function doLogin() {
  const email = val('login-email').trim();
  const pass  = val('login-pass').trim();
  clearErr('login-error');

  if (!email || !pass) { setErr('login-error', 'Completa todos los campos.'); return; }
  if (!isValidEmail(email)) { setErr('login-error', 'Correo electrónico inválido.'); return; }

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    applyAuthenticatedUser(data.user, data.token);
  } catch (error) {
    if (email === DEMO_CREDENTIALS.email && pass === DEMO_CREDENTIALS.password) {
      STATE.currentUser = { name: 'Heily Natalia Escobar Mendoza', initials: 'HN', email };
      enterApp();
      return;
    }
    setErr('login-error', error.message || 'No se pudo iniciar sesión');
  }
}

async function doRegister() {
  const name  = val('reg-name').trim();
  const email = val('reg-email').trim();
  const pass  = val('reg-pass').trim();
  clearErr('reg-error');

  if (!name || !email || !pass) { setErr('reg-error', 'Completa todos los campos.'); return; }
  if (!isValidEmail(email)) { setErr('reg-error', 'Correo electrónico inválido.'); return; }
  if (pass.length < 6) { setErr('reg-error', 'La contraseña debe tener al menos 6 caracteres.'); return; }

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass }),
    });
    applyAuthenticatedUser(data.user, data.token);
  } catch (error) {
    setErr('reg-error', error.message || 'No se pudo registrar');
  }
}

function doForgot() {
  const email = val('forgot-email').trim();
  if (!email || !isValidEmail(email)) { showToast('Ingresa un correo válido'); return; }
  showToast('Te enviamos un enlace de recuperación a ' + email);
  showLogin();
}

function enterApp() {
  hide('auth-screen');
  show('app-screen');
  // Update avatar initials
  const ini = STATE.currentUser.initials;
  document.getElementById('topbar-avatar').textContent  = ini;
  document.getElementById('post-avatar').textContent    = ini;
  document.getElementById('profile-avatar-display').textContent = ini;
  updateProfileUI();
  navigate('feed');
}

// Sincroniza la UI del perfil con los datos del usuario autenticado
function updateProfileUI() {
  if (!STATE.currentUser) return;
  const u = STATE.currentUser;
  const name = u.name || 'Usuario';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'U';
  const email = u.email || '';
  const title = u.title || '';
  const location = u.location || '';
  const bio = u.bio || '';

  setText('display-name', name);
  setText('display-title', title || '—');
  setText('display-bio', bio);
  const locationEl = document.getElementById('display-location');
  if (locationEl) {
    locationEl.innerHTML = `
      ${email ? `<span><svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg> ${escHtml(email)}</span>` : ''}
      ${location ? `<span><svg viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.7"/></svg> ${escHtml(location)}</span>` : ''}
      <span><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg> Miembro desde 2024</span>
    `;
  }

  // Actualizar valores del formulario de edición si existen
  const efName = document.getElementById('ef-name'); if (efName) efName.value = name;
  const efTitle = document.getElementById('ef-title'); if (efTitle) efTitle.value = title;
  const efEmail = document.getElementById('ef-email'); if (efEmail) efEmail.value = email;
  const efLocation = document.getElementById('ef-location'); if (efLocation) efLocation.value = location;
  const efBio = document.getElementById('ef-bio'); if (efBio) efBio.value = bio;

  const profAvText = document.getElementById('profile-avatar-display'); if (profAvText) profAvText.textContent = initials;
  const topAvText = document.getElementById('topbar-avatar'); if (topAvText) topAvText.textContent = initials;
  const postAvText = document.getElementById('post-avatar'); if (postAvText) postAvText.textContent = initials;
  const editAvText = document.getElementById('edit-avatar-display'); if (editAvText) editAvText.textContent = initials;

  // Actualizar colores de avatar según nombre/initials
  const color = u.color || avatarColor(u.name || u.initials);
  const profAv = document.getElementById('profile-avatar-display'); if (profAv) profAv.style.background = color;
  const topAv = document.getElementById('topbar-avatar'); if (topAv) topAv.style.background = color;
  const postAv = document.getElementById('post-avatar'); if (postAv) postAv.style.background = color;
  const editAv = document.getElementById('edit-avatar-display'); if (editAv) editAv.style.background = color;
}

function doLogout() {
  showConfirmModal(
    '¿Cerrar sesión?',
    'Se cerrará tu sesión en LinkUp.',
    () => {
      STATE.currentUser = null;
      clearAuthSession();
      hide('app-screen');
      show('auth-screen');
      showLogin();
      showToast('Sesión cerrada correctamente');
    }
  );
}

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function navigate(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => { p.classList.add('hidden'); p.classList.remove('active'); });
  // Deactivate nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));

  // Show target
  const target = document.getElementById('page-' + page);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }

  // Activate nav
  const navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (navItem) navItem.classList.add('active');

  STATE.currentPage = page;

  // Render page content
  if (page === 'feed')          { renderPosts(); renderSuggestions(); }
  if (page === 'notifications') { renderNotifications(); }
  if (page === 'employment')    { renderJobs(); }
  if (page === 'messages')      { selectContact(STATE.activeContact); }
  if (page === 'search')        { renderSearch(document.getElementById('global-search').value); }

  // En móviles, cerrar la barra lateral si está abierta
  hideMobileSidebar();
}

// Mobile sidebar control
function toggleMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (!sb) return;
  const isOpen = sb.classList.contains('mobile-open');
  if (isOpen) {
    sb.classList.remove('mobile-open');
    if (overlay) { overlay.classList.remove('visible'); overlay.classList.add('hidden'); }
  } else {
    sb.classList.add('mobile-open');
    if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('visible'); }
  }
}

function hideMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (!sb) return;
  sb.classList.remove('mobile-open');
  if (overlay) { overlay.classList.remove('visible'); overlay.classList.add('hidden'); }
}

// ══════════════════════════════════════
// FEED
// ══════════════════════════════════════
function renderPosts() {
  const container = document.getElementById('posts-container');
  container.innerHTML = POSTS.map(p => postHTML(p)).join('');
}

function postHTML(p) {
  return `
    <div class="card post-card" id="post-${p.id}">
      <div class="post-header">
        <div class="avatar md" style="background:${p.user.color}">${p.user.initials}</div>
        <div>
          <div class="post-author-name">${p.user.name}</div>
          <div class="post-author-meta">${p.user.role} &nbsp;·&nbsp; ${p.time}</div>
        </div>
        <button class="post-menu-btn" onclick="showToast('Opciones del post')">⋯</button>
      </div>
      <div class="post-body">${escHtml(p.content)}</div>
      <div class="post-actions">
        <button class="action-btn ${p.liked ? 'liked' : ''}" onclick="toggleLike(${p.id})">
          <svg viewBox="0 0 24 24" fill="${p.liked ? 'currentColor' : 'none'}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          ${p.likes}
        </button>
        <button class="action-btn" onclick="showToast('Comentarios próximamente')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          ${p.comments}
        </button>
        <button class="action-btn" onclick="showToast('Publicación compartida')">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.5"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="1.5"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="1.5"/></svg>
          Compartir
        </button>
      </div>
    </div>`;
}

function toggleLike(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  renderPosts();
}

async function publishPost() {
  const ta = document.getElementById('post-textarea');
  const content = ta.value.trim();
  if (!content) { showToast('Escribe algo para publicar'); return; }

  try {
    const data = await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    POSTS.unshift(data.post);
    ta.value = '';
    renderPosts();
    showToast('¡Publicación creada!');
  } catch (error) {
    showToast(error.message || 'No se pudo publicar');
  }
}

// Suggestions
function renderSuggestions() {
  const list = document.getElementById('suggestions-list');
  list.innerHTML = USERS.slice(0, 4).map(u => `
    <div class="suggest-item">
      <div class="avatar sm" style="background:${u.color}">${u.initials}</div>
      <div class="suggest-info">
        <div class="suggest-name">${u.name}</div>
        <div class="suggest-role">${u.role.split(' ').slice(0,3).join(' ')}</div>
      </div>
      <button class="btn-follow ${u.following ? 'following' : ''}" onclick="toggleFollowById(${u.id}, this)">
        ${u.following ? 'Siguiendo' : 'Seguir'}
      </button>
    </div>
  `).join('');
}

function toggleFollowById(id, btn) {
  const u = USERS.find(x => x.id === id);
  if (!u) return;
  u.following = !u.following;
  btn.textContent = u.following ? 'Siguiendo' : 'Seguir';
  btn.className = 'btn-follow' + (u.following ? ' following' : '');
  showToast(u.following ? `Siguiendo a ${u.name}` : `Dejaste de seguir a ${u.name}`);
}

// ══════════════════════════════════════
// PROFILE
// ══════════════════════════════════════
function toggleEditForm() {
  const form = document.getElementById('edit-form');
  form.classList.toggle('hidden');
}

async function saveProfile() {
  const name     = val('ef-name').trim();
  const title    = val('ef-title').trim();
  const email    = val('ef-email').trim();
  const location = val('ef-location').trim();
  const bio      = val('ef-bio').trim();

  if (!name) { showToast('El nombre es obligatorio'); return; }

  try {
    const data = await apiRequest('/me', {
      method: 'PUT',
      body: JSON.stringify({ name, title, location, bio }),
    });
    STATE.currentUser = Object.assign({}, STATE.currentUser, data.user, { email });
    updateProfileUI();
    document.getElementById('edit-form').classList.add('hidden');
    showToast('Perfil actualizado correctamente');
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el perfil');
  }
}

function showDeleteModal() {
  showConfirmModal(
    '¿Estás seguro?',
    'Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos de nuestros servidores.',
    () => {
      showToast('Cuenta eliminada');
      setTimeout(doLogout, 800);
    },
    true
  );
}

// ══════════════════════════════════════
// SEARCH
// ══════════════════════════════════════
function handleGlobalSearch(q) {
  if (STATE.currentPage !== 'search') navigate('search');
  // Sincroniza ambos inputs (topbar y página) y renderiza
  const pageInput = document.getElementById('page-search-input');
  const topInput = document.getElementById('global-search');
  if (topInput && topInput.value !== q) topInput.value = q;
  if (pageInput && pageInput.value !== q) pageInput.value = q;
  renderSearch(q);
}

function renderSearch(q) {
  const query = (q || '').toLowerCase();
  const results = query
    ? USERS.filter(u => u.name.toLowerCase().includes(query) || u.role.toLowerCase().includes(query))
    : USERS;

  document.getElementById('search-result-count').textContent =
    results.length + ' resultado' + (results.length !== 1 ? 's' : '');

  document.getElementById('search-results-container').innerHTML = results.length
    ? results.map(u => {
        const avatarUrl = SEARCH_AVATARS[u.id];
        return `
        <div class="user-result-card">
          ${avatarUrl
            ? `<img class="search-avatar" src="${avatarUrl}" alt="${escHtml(u.name)}" loading="lazy" />`
            : `<div class="avatar md" style="background:${u.color}">${u.initials}</div>`}
          <div class="user-result-info">
            <div class="user-result-name">${u.name}</div>
            <div class="user-result-role">${u.role}</div>
          </div>
          <button class="btn-follow ${u.following ? 'following' : ''}" onclick="toggleFollowById(${u.id}, this)">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 18a6 6 0 0 1 11 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17 8h5M19.5 5.5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span>${u.following ? 'Siguiendo' : 'Seguir'}</span>
          </button>
        </div>`;
      }).join('')
    : '<div class="empty-state">No se encontraron usuarios para "<strong>' + escHtml(q) + '</strong>"</div>';
}

// Inicializar listeners para el input de la página de búsqueda
function initPageSearchInput() {
  const pageInput = document.getElementById('page-search-input');
  const topInput = document.getElementById('global-search');
  if (pageInput) {
    pageInput.addEventListener('input', e => {
      const v = e.target.value;
      if (topInput && topInput.value !== v) topInput.value = v;
      renderSearch(v);
    });
    pageInput.addEventListener('focus', () => { if (STATE.currentPage !== 'search') navigate('search'); });
  }
}

// ══════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════
function renderContacts() {
  const list = document.getElementById('contacts-list');
  list.innerHTML = USERS.map(u => {
    const conv = CONVERSATIONS[u.id];
    const lastMsg = conv && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : 'Sin mensajes';
    const lastTime = conv && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].time : '';
    const unreadCount = u.id === 1 ? 2 : 0;
    const isActive = u.id === STATE.activeContact;
    const imgHtml = (SEARCH_AVATARS[u.id])
      ? `<img class="contact-img" src="${SEARCH_AVATARS[u.id]}" alt="${escHtml(u.name)}" />`
      : `<div class="avatar sm" style="background:${u.color}">${u.initials}</div>`;
    const previewText = lastMsg;
    return `
      <div class="contact-item ${isActive ? 'active' : ''}" onclick="selectContact(${u.id})">
        ${imgHtml}
        <div class="contact-info">
          <div class="contact-topline">
            <div class="contact-name">${escHtml(u.name)}</div>
            <div class="contact-time">${escHtml(lastTime)}</div>
          </div>
          <div class="contact-preview">${escHtml(previewText)}</div>
        </div>
        ${unreadCount > 0 ? `<div class="unread-dot">${unreadCount}</div>` : ''}
      </div>`;
  }).join('');
}

function selectContact(id) {
  STATE.activeContact = id;
  const u = USERS.find(x => x.id === id);
  if (!u) return;
  const chatAv = document.getElementById('chat-av-display');
  if (chatAv && SEARCH_AVATARS[u.id]) {
    chatAv.innerHTML = `<img src="${SEARCH_AVATARS[u.id]}" alt="${escHtml(u.name)}" class="contact-img" style="width:34px;height:34px;border-radius:50%;"/>`;
    chatAv.style.background = 'transparent';
    chatAv.classList.toggle('online', !!u.online);
  } else {
    if (chatAv) {
      chatAv.textContent = u.initials;
      chatAv.style.background = u.color;
      chatAv.classList.toggle('online', !!u.online);
    }
  }
  const chatName = document.getElementById('chat-contact-name');
  if (chatName) chatName.textContent = u.name;
  const chatStatus = document.getElementById('chat-header')?.querySelector('.chat-status');
  if (chatStatus) chatStatus.textContent = u.online ? '● En línea' : '○ Desconectado';
  renderContacts();
  renderChat(id);
}

function renderChat(id) {
  if (!CONVERSATIONS[id]) CONVERSATIONS[id] = { messages: [] };
  const messages = CONVERSATIONS[id].messages;
  const area = document.getElementById('chat-messages');

  if (messages.length === 0) {
    area.innerHTML = '<div class="empty-state" style="margin-top:40px">Aún no hay mensajes. ¡Empieza la conversación!</div>';
    return;
  }

  area.innerHTML = messages.map(m => `
    <div class="msg-wrap ${m.mine ? 'mine' : 'theirs'}">
      <div class="msg-bubble ${m.mine ? 'mine' : 'theirs'}">
        ${escHtml(m.text)}
        <div class="msg-time">${m.time}</div>
      </div>
    </div>
  `).join('');
  area.scrollTop = area.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  if (!CONVERSATIONS[STATE.activeContact]) CONVERSATIONS[STATE.activeContact] = { messages: [] };

  const now = new Date();
  const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

  CONVERSATIONS[STATE.activeContact].messages.push({ mine: true, text, time: timeStr });
  input.value = '';
  renderChat(STATE.activeContact);
  renderContacts();

  // Auto-reply
  setTimeout(() => {
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const replyTime = now.getHours() + ':' + String(now.getMinutes() + 1).padStart(2, '0');
    CONVERSATIONS[STATE.activeContact].messages.push({ mine: false, text: reply, time: replyTime });
    renderChat(STATE.activeContact);
    renderContacts();
  }, 1000 + Math.random() * 800);
}

// ══════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════
function getNotificationIcon(iconClass) {
  const icons = {
    'like': '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'follow': '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'msg': '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'comment': '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'job': '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>'
  };
  return icons[iconClass] || '';
}

function renderNotifications() {
  document.getElementById('notifications-list').innerHTML = NOTIFICATIONS.map(n => {
    let avatarHtml = '';
    const iconSvg = getNotificationIcon(n.iconClass);
    if (n.avatarImg && n.avatarImg.trim()) {
      avatarHtml = `<div class="notif-avatar-wrap"><img src="${n.avatarImg}" alt="${n.userInitials}" class="notif-avatar-img" /><div class="notif-icon-badge ${n.iconClass}">${iconSvg}</div></div>`;
    } else {
      avatarHtml = `<div class="notif-avatar-wrap"><div class="notif-avatar avatar sm" style="background:${n.userColor}">${n.userInitials}</div><div class="notif-icon-badge ${n.iconClass}">${iconSvg}</div></div>`;
    }
    return `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        ${avatarHtml}
        <div class="notif-body">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${n.unread ? '<div class="notif-unread-indicator"></div>' : ''}
      </div>
    `;
  }).join('');
}

function markAllRead() {
  NOTIFICATIONS.forEach(n => n.unread = false);
  STATE.unreadNotifCount = 0;
  document.getElementById('nav-notif-badge').style.display = 'none';
  document.getElementById('notif-badge').style.display     = 'none';
  renderNotifications();
  showToast('Todas las notificaciones leídas');
}

// ══════════════════════════════════════
// EMPLOYMENT
// ══════════════════════════════════════
function renderJobs() {
  const available = JOBS.filter(j => !j.applied);
  const applied   = JOBS.filter(j => j.applied);

  document.getElementById('count-available').textContent = available.length;
  document.getElementById('count-applied').textContent   = applied.length;

  document.getElementById('jobs-available-list').innerHTML = available.length
    ? available.map(j => jobCardHTML(j)).join('')
    : '<div class="empty-state">No hay ofertas disponibles actualmente.</div>';

  document.getElementById('jobs-applied-list').innerHTML = applied.length
    ? applied.map(j => jobCardHTML(j)).join('')
    : '<div class="empty-state">Aún no tienes postulaciones activas.</div>';
}

function jobCardHTML(j) {
  const logoHtml = j.logo ? `<img src="${escHtml(j.logo)}" alt="${escHtml(j.company)}" />` : escHtml(j.company.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase());
  const appliedBadge = j.applied ? `<div class="job-applied-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg> Aplicado</div>` : '';
  const actionBtn = j.applied
    ? '<button class="btn-apply applied">Aplicado</button>'
    : `<button class="btn-apply" onclick="applyJob(${j.id})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-3-9-9-3 19-8z"/></svg>Postularse</button>`;

  return `
    <div class="job-card">
      ${appliedBadge}
      <div class="job-top">
        <div class="job-logo">${logoHtml}</div>
        <div class="job-headings">
          <div class="job-title">${escHtml(j.title)}</div>
          <div class="job-company">${escHtml(j.company)}</div>
        </div>
      </div>
      <div class="job-info">
        <div class="job-tags">
          <span class="job-tag"><svg viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>${escHtml(j.location)}</span>
          <span class="job-tag"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${escHtml(j.type)}</span>
          <span class="job-tag"><svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12M6 12h12M6 16h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="16" r="1" fill="currentColor"/></svg>${escHtml(j.salary)}</span>
        </div>
        <div class="job-desc">${escHtml(j.desc)}</div>
        <div class="job-footer">
          <span class="job-date">${j.applied ? 'Aplicado · ' + j.date : j.date}</span>
          ${actionBtn}
        </div>
      </div>
    </div>`;
}

function applyJob(id) {
  const job = JOBS.find(j => j.id === id);
  if (!job) return;

  showConfirmModal(
    '¿Confirmar postulación?',
    `Vas a postularte a "${job.title}" en ${job.company}. Esta acción quedará registrada.`,
    () => {
      job.applied = true;
      job.date = 'hoy';
      renderJobs();
      showToast('¡Postulación enviada a ' + job.company + '!');
    }
  );
}

function switchEmpTab(tab) {
  STATE.empTab = tab;
  document.getElementById('tab-available-btn').classList.toggle('active', tab === 'available');
  document.getElementById('tab-applied-btn').classList.toggle('active',   tab === 'applied');
  document.getElementById('jobs-available-list').classList.toggle('hidden', tab !== 'available');
  document.getElementById('jobs-applied-list').classList.toggle('hidden',   tab !== 'applied');
}

function toggleJobForm(forceClose = false) {
  const overlay = document.getElementById('publish-job-overlay');
  if (!overlay) return;
  if (forceClose) {
    overlay.classList.add('hidden');
    return;
  }
  overlay.classList.toggle('hidden');
}

function publishJob() {
  const title   = val('jf-title').trim();
  const company = val('jf-company').trim();
  const desc    = val('jf-desc').trim();
  clearErr('job-form-error');

  if (!title || !company || !desc) {
    setErr('job-form-error', 'Los campos marcados con * son obligatorios.');
    return;
  }

  // Validate: no duplicate posting
  if (JOBS.some(j => j.title.toLowerCase() === title.toLowerCase() && j.company.toLowerCase() === company.toLowerCase())) {
    setErr('job-form-error', 'Ya existe una oferta con ese título en esa empresa.');
    return;
  }

  JOBS.unshift({
    id:       Date.now(),
    emoji:    '',
    title,
    company,
    location: val('jf-location').trim() || 'Colombia',
    type:     val('jf-type').trim()     || 'Tiempo completo',
    salary:   val('jf-salary').trim()   || 'A convenir',
    desc,
    date: 'Ahora mismo',
    applied: false,
  });

  ['jf-title','jf-company','jf-location','jf-salary','jf-type','jf-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('publish-job-overlay').classList.add('hidden');
  switchEmpTab('available');
  renderJobs();
  showToast('¡Oferta publicada exitosamente!');
}

const publishJobOverlay = document.getElementById('publish-job-overlay');
if (publishJobOverlay) {
  publishJobOverlay.addEventListener('click', function(e) {
    if (e.target === this) toggleJobForm(true);
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('publish-job-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      toggleJobForm(true);
    }
  }
});

// ══════════════════════════════════════
// MODAL
// ══════════════════════════════════════
let _modalCallback = null;

function showConfirmModal(title, desc, onConfirm, isDanger = false) {
  _modalCallback = onConfirm;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-desc').textContent  = desc;
  const btn = document.getElementById('modal-confirm-btn');
  btn.textContent = isDanger ? 'Eliminar cuenta' : 'Confirmar';
  btn.className   = isDanger ? 'btn-danger' : 'btn-primary';
  btn.onclick     = () => {
    const callback = _modalCallback;
    _modalCallback = null;
    document.getElementById('modal-overlay').classList.add('hidden');
    if (callback) callback();
  };
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  _modalCallback = null;
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════
let _toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function val(id)  { const el = document.getElementById(id); return el ? el.value : ''; }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setErr(id, msg)   { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErr(id)      { const el = document.getElementById(id); if (el) el.textContent = ''; }
function isValidEmail(e)   { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
(function init() {
  // Show auth screen on load
  show('auth-screen');
  hide('app-screen');

  // Enter key on login
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('reg-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doRegister();
  });
  document.getElementById('forgot-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') doForgot();
  });

  // Inicializar listener del input de búsqueda de la página (si existe)
  initPageSearchInput();

  // Badge init
  if (STATE.unreadNotifCount > 0) {
    document.getElementById('nav-notif-badge').textContent = STATE.unreadNotifCount;
    document.getElementById('notif-badge').style.display = 'block';
  }

  bootstrapSession();
  loadPostsFromApi();
  loadNotificationsFromApi();
})();
