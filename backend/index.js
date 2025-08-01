const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const db = mysql.createConnection({
  host: "localhost",
  user: "projectuser",
  password: "MySuperPass123!",
  database: "projectdb",
});

// ======= PROJECTS =======

// Получить все проекты
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Добавить проект
app.post("/api/projects", (req, res) => {
  const { product, startDate, deadline, responsible, status, executors } = req.body;
  db.query(
    'INSERT INTO projects (product, startDate, deadline, responsible, status, executors) VALUES (?, ?, ?, ?, ?, ?)',
    [product, startDate, deadline, responsible, status, executors || ""],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: results.insertId });
    }
  );
});

// ======= SUBORDERS =======

// Получить все подзаказы
app.get("/api/suborders", (req, res) => {
  db.query("SELECT * FROM suborders", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Получить подзаказы по проекту
app.get("/api/suborders/:project_id", (req, res) => {
  db.query(
    "SELECT * FROM suborders WHERE project_id = ?",
    [req.params.project_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// Получить ОДИН подзаказ по id
app.get("/api/suborder/:id", (req, res) => {
  db.query(
    "SELECT * FROM suborders WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results[0] || null);
    }
  );
});

// Добавить подзаказ
app.post("/api/suborders", (req, res) => {
  const { project_id, product, startDate, deadline, responsible, progress } = req.body;
  db.query(
    "INSERT INTO suborders (project_id, product, startDate, deadline, responsible, progress) VALUES (?, ?, ?, ?, ?, ?)",
    [project_id, product, startDate, deadline, responsible, progress || 0],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, id: results.insertId });
    }
  );
});

// ======= ORDERS =======

// Получить задания по проекту и подзаказу (для определения номера)
app.get("/api/orders", (req, res) => {
  const { project_id, order_id } = req.query;
  if (!project_id || !order_id) {
    return res.status(400).json({ error: "project_id и order_id обязательны" });
  }
  db.query(
    "SELECT * FROM orders WHERE project_id = ? AND order_id = ? ORDER BY seq_num ASC",
    [project_id, order_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// Добавить задание (и присвоить номер задания строкам спецификации)
app.post("/api/orders", (req, res) => {
  const { project_id, order_id, seq_num, order_number, description, row_ids } = req.body;

  db.query(
    "INSERT INTO orders (project_id, order_id, seq_num, order_number, description) VALUES (?, ?, ?, ?, ?)",
    [project_id, order_id, seq_num, order_number, description],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // Обновить taskId для выбранных строк спецификации
      if (Array.isArray(row_ids) && row_ids.length > 0) {
        const sql = `UPDATE spec_rows SET taskId = ? WHERE id IN (${row_ids.map(() => '?').join(',')})`;
        db.query(sql, [order_number, ...row_ids], (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true, id: results.insertId, order_number });
        });
      } else {
        res.json({ success: true, id: results.insertId, order_number });
      }
    }
  );
});

// ======= SPEC BATCHES / ROWS =======

// Загрузка новой спецификации
app.post("/api/spec/:suborder_id", (req, res) => {
  const { rows, uploaded_by } = req.body;
  const suborder_id = req.params.suborder_id;

  db.query(
    "INSERT INTO spec_batches (suborder_id, uploaded_by) VALUES (?, ?)",
    [suborder_id, uploaded_by || "Аноним"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const batch_id = result.insertId;
      if (!rows?.length) return res.json({ success: true });
      const values = rows.map(r => [
        batch_id,
        r.partNum,
        r.name,
        r.code,
        r.material,
        r.count,
        r.made,
        r.cell,
        r.status,
        r.taskId
      ]);
      db.query(
        "INSERT INTO spec_rows (batch_id, partNum, name, code, material, count, made, cell, status, taskId) VALUES ?",
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true });
        }
      );
    }
  );
});

// Получить спецификацию для подзаказа
app.get("/api/spec/:suborder_id", (req, res) => {
  db.query(
    "SELECT * FROM spec_batches WHERE suborder_id = ? ORDER BY uploaded_at ASC",
    [req.params.suborder_id],
    (err, batches) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!batches.length) return res.json([]);
      const batchIds = batches.map(b => b.id);
      db.query(
        `SELECT * FROM spec_rows WHERE batch_id IN (${batchIds.map(id => db.escape(id)).join(",")})`,
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2.message });
          const grouped = batches.map(batch => ({
            ...batch,
            rows: rows.filter(r => r.batch_id == batch.id)
          }));
          res.json(grouped);
        }
      );
    }
  );
});

// PATCH — обновить строку спецификации по id
app.patch("/api/specrow/:id", (req, res) => {
  const { made, cell, status } = req.body;
  db.query(
    "UPDATE spec_rows SET made=?, cell=?, status=? WHERE id=?",
    [made, cell, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(3001, () => {
  console.log("API сервер запущен на http://localhost:3001");
});
