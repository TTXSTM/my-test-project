const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "projectuser",
  password: "MySuperPass123!",
  database: "projectdb",
});

// Получить все проекты
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Добавить проект
app.post('/api/projects', (req, res) => {
  const { id, product, startDate, deadline, responsible, status, executors } = req.body;
  db.query(
    'INSERT INTO projects (id, product, startDate, deadline, responsible, status, executors) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, product, startDate, deadline, responsible, status, executors || ""],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id });
    }
  );
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

// Добавить подзаказ (id теперь не нужен во входных данных!)
app.post("/api/suborders", (req, res) => {
  const { project_id, product, startDate, deadline, responsible, progress } = req.body;
  db.query(
    "INSERT INTO suborders (project_id, product, startDate, deadline, responsible, progress) VALUES (?, ?, ?, ?, ?, ?)",
    [project_id, product, startDate, deadline, responsible, progress || 0],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      // Возвращаем сгенерированный id
      res.json({ success: true, id: results.insertId });
    }
  );
});

app.listen(3001, () => {
  console.log("API сервер запущен на http://localhost:3001");
});
