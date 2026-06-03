const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'linkup-dev-secret';
const DB_NAME = process.env.DB_NAME || 'linkup_db';
const ROOT_DIR = __dirname;
const INDEX_FILE = path.join(ROOT_DIR, 'index.html');

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT_DIR));

const bootstrapPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let pool = null;

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

async function ensureSchema() {
  try {
    // Intenta crear la base de datos, pero ignora el error si ya existe
    await bootstrapPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } catch (error) {
    console.log('Database creation info:', error.message);
    // Continúa aunque haya error
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const schemaPath = path.join(ROOT_DIR, 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = schemaSql
    .split(/;\s*\n/)
    .map(statement => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    if (/^USE\s+/i.test(statement)) continue;
    try {
      await pool.query(statement);
    } catch (error) {
      console.log('Schema statement info:', error.message);
      // Continúa incluso si hay errores en las sentencias
    }
  }

  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', ['demo@linkup.co']);
  let demoUserId = rows.length > 0 ? rows[0].id : null;
  if (!demoUserId) {
    const passwordHash = await bcrypt.hash('123456', 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, title, location, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'Heily Natalia Escobar Mendoza',
        'demo@linkup.co',
        passwordHash,
        'Ingeniería de Sistemas — Universidad Simón Bolívar',
        'Cúcuta, Colombia',
        'Apasionada por el desarrollo de software y la tecnología. Especializada en React, Python y arquitecturas cloud.',
      ]
    );
    demoUserId = result.insertId;
  }

  const [contactRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['carlos@linkup.co']);
  let contactUserId = contactRows.length > 0 ? contactRows[0].id : null;
  if (!contactUserId) {
    const passwordHash = await bcrypt.hash('123456', 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, title, location, bio, initials, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        'Carlos Rodríguez',
        'carlos@linkup.co',
        passwordHash,
        'CEO en StartupLab',
        'Bogotá, Colombia',
        'Apasionado por la innovación y el liderazgo de equipos de producto.',
        'CR',
        '#2563EB',
      ]
    );
    contactUserId = result.insertId;
  }

  const [posts] = await pool.query('SELECT id FROM posts LIMIT 1');
  if (posts.length === 0 && demoUserId) {
    await pool.query(
      'INSERT INTO posts (user_id, content, likes, comments, liked, time_label) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
      [
        demoUserId, 'Emocionada de compartir que acabo de completar mi certificación en Cloud Computing. Gracias a todos los que me apoyaron en este viaje de aprendizaje.', 124, 18, 0, 'Hace 2 horas',
        demoUserId, 'Estamos buscando talento increíble para unirnos a nuestro equipo. Si eres apasionado por la innovación y quieres hacer un impacto real, contáctame.', 87, 34, 0, 'Hace 4 horas',
        demoUserId, 'Principio de diseño del día: menos es más. Un buen diseño no necesita explicación. La claridad supera a la complejidad siempre.', 203, 45, 1, 'Hace 6 horas',
      ]
    );
  }

  const [notifications] = await pool.query('SELECT id FROM notifications LIMIT 1');
  if (notifications.length === 0 && demoUserId) {
    await pool.query(
      'INSERT INTO notifications (user_id, type, text_message, time_label, unread) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [
        demoUserId, 'like', '<strong>Carlos Rodríguez</strong> le gusta tu publicación', 'Hace 5 minutos', 1,
        demoUserId, 'follow', '<strong>Ana Chen</strong> comenzó a seguirte', 'Hace 1 hora', 1,
        demoUserId, 'msg', '<strong>Roberto Martínez</strong> te envió un mensaje', 'Hace 2 horas', 1,
        demoUserId, 'comment', '<strong>Laura Sánchez</strong> comentó en tu publicación: "Felicidades"', 'Hace 3 horas', 0,
        demoUserId, 'job', '<strong>TechCorp</strong> publicó una nueva oferta que podría interesarte', 'Hace 1 día', 0,
        demoUserId, 'like', '<strong>Diego López</strong> y 12 personas más reaccionaron a tu publicación', 'Hace 2 días', 0,
      ]
    );
  }

  const [jobs] = await pool.query('SELECT id FROM jobs LIMIT 1');
  if (jobs.length === 0) {
    await pool.query(
      'INSERT INTO jobs (title, company, location, job_type, salary, description, posted_at, applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        'Desarrollador Full Stack Senior', 'TechCorp', 'Cúcuta, Colombia', 'Tiempo completo', '$5.000.000 - $8.000.000', 'Buscamos un desarrollador con experiencia en React y Python. Trabajarás en proyectos innovadores con un equipo dinámico.', 'Hace 3 días', 0,
        'Product Manager', 'StartupLab', 'Bogotá / Remoto', 'Híbrido', '$6.000.000 - $9.000.000', 'Lidera el desarrollo de productos innovadores en una startup en crecimiento. Experiencia previa en productos tecnológicos es esencial.', 'Hace 3 días', 0,
        'Data Scientist', 'AI Corp', 'Medellín, Colombia', 'Tiempo completo', '$7.000.000 - $11.000.000', 'Trabaja con grandes volúmenes de datos y machine learning. Se requiere experiencia con Python, TensorFlow y análisis estadístico.', 'Hace 5 días', 0,
      ]
    );
  }

  const [conversations] = await pool.query('SELECT id FROM conversations LIMIT 1');
  if (conversations.length === 0 && demoUserId) {
    const [conversationResult] = await pool.query(
      'INSERT INTO conversations (user_one_id, user_two_id, last_message, last_message_at) VALUES (?, ?, ?, ?)',
      [demoUserId, contactUserId, '¿Viste mi última publicación?', '10:30 AM']
    );

    await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, message_text, sent_at, mine) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [
        conversationResult.insertId, contactUserId, 'Hola, ¿cómo estás?', '10:00 AM', 0,
        conversationResult.insertId, demoUserId, '¡Hola Carlos! Todo bien, gracias. ¿Y tú?', '10:05 AM', 1,
        conversationResult.insertId, contactUserId, 'Muy bien. Te quería comentar sobre el proyecto.', '10:10 AM', 0,
      ]
    );
  }
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    title: row.title || '',
    location: row.location || '',
    bio: row.bio || '',
    initials: row.initials || row.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    color: row.color || '#7C3AED',
  };
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Database unavailable' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Completa todos los campos' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const color = '#7C3AED';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, initials, color) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, initials, color]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      title: '',
      location: '',
      bio: '',
      initials,
      color,
    };

    const token = signUser(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar el usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Completa todos los campos' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const userRow = rows[0];
    const ok = await bcrypt.compare(String(password), userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = normalizeUser(userRow);
    const token = signUser(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

app.get('/api/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.auth.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: normalizeUser(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
});

app.put('/api/me', authRequired, async (req, res) => {
  try {
    const { name, title, location, bio } = req.body || {};
    const updates = [];
    const values = [];

    if (typeof name === 'string') {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (typeof title === 'string') {
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (typeof location === 'string') {
      updates.push('location = ?');
      values.push(location.trim());
    }
    if (typeof bio === 'string') {
      updates.push('bio = ?');
      values.push(bio.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay cambios para guardar' });
    }

    values.push(req.auth.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.auth.id]);
    res.json({ user: normalizeUser(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.likes, p.comments, p.liked, p.time_label, u.name, u.initials, u.color, u.title AS role
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`
    );

    res.json({
      posts: rows.map(row => ({
        id: row.id,
        user: {
          name: row.name,
          initials: row.initials,
          color: row.color,
          role: row.role || '',
        },
        content: row.content,
        time: row.time_label,
        likes: row.likes,
        comments: row.comments,
        liked: !!row.liked,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las publicaciones' });
  }
});

app.post('/api/posts', authRequired, async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'El contenido es obligatorio' });
    }

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, likes, comments, liked, time_label) VALUES (?, ?, ?, ?, ?, ?)',
      [req.auth.id, String(content).trim(), 0, 0, 0, 'Ahora mismo']
    );

    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.likes, p.comments, p.liked, p.time_label, u.name, u.initials, u.color, u.title AS role
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [result.insertId]
    );

    const row = rows[0];
    res.status(201).json({
      post: {
        id: row.id,
        user: { name: row.name, initials: row.initials, color: row.color, role: row.role || '' },
        content: row.content,
        time: row.time_label,
        likes: row.likes,
        comments: row.comments,
        liked: !!row.liked,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la publicación' });
  }
});

app.get('/api/notifications', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, type, text_message, time_label, unread FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.auth.id]
    );

    res.json({
      notifications: rows.map(row => ({
        id: row.id,
        type: row.type,
        text: row.text_message,
        time: row.time_label,
        unread: !!row.unread,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las notificaciones' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(INDEX_FILE);
});

async function start() {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`LinkUp server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();