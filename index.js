const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;

// Connect to SQLite database (creates file if it doesn't exist)
const db = new Database('webshop.db');
console.log('Connected to SQLite database');

// Create products table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL
)`).run();

app.use(express.json());

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
  const { name, price } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
    const info = stmt.run(name, price);
    res.json({ id: info.lastInsertRowid, name, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
