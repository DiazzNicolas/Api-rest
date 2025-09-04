const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Conectar a la base de datos
const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error("Error al conectar a SQLite:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// Middleware para JSON
app.use(express.json());

/* ========== RUTAS ========== */

// Obtener todos los productos
app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un producto por ID
app.get('/products/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(row);
  });
});

// Crear un nuevo producto
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null) {
    res.status(400).json({ error: "Faltan datos (name, price)" });
    return;
  }
  db.run("INSERT INTO products (name, price) VALUES (?, ?)", [name, price], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, price });
  });
});

// Actualizar un producto
app.put('/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, price } = req.body;
  if (!name || price == null) {
    res.status(400).json({ error: "Faltan datos (name, price)" });
    return;
  }
  db.run("UPDATE products SET name = ?, price = ? WHERE id = ?", [name, price, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ id, name, price });
  });
});

// Eliminar un producto
app.delete('/products/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ message: `Producto ${id} eliminado` });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
