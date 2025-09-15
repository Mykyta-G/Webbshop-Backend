const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;
const cors = require('cors');

//app.use(cors());

app.use(express.static(__dirname));
app.use(express.json());

// Connect to SQLite database (creates file if it doesn't exist)
const db = new Database('webshop.db');
console.log('Connected to SQLite database');

// Create products table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  color TEXT NOT NULL,
  spin TEXT NOT NULL
)`).run();

// Create users table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0
)`).run();

// Default users
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)').run('admin', 'adminpassword', 1);
  db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)').run('user', 'userpassword', 0);
}

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // 1. Look up user in database
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // 2. Compare password (hash)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // 3. Respond 
  res.json({ message: 'Login successful', user });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a product
app.post('/api/products', (req, res) => {
  const { name, description, price } = req.body;
  try {
    const info = db.prepare('INSERT INTO products (name, description, price) VALUES (?, ?, ?)').run(name, description, price);
    res.json({ id: info.lastInsertRowid, name, description, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
