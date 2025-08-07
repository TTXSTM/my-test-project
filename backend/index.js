const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const db = mysql.createPool({
  host: "localhost",
  user: "projectuser",
  password: "MySuperPass123!",
  database: "projectdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========================
//    СПРАВОЧНЫЕ МАРШРУТЫ
// ========================
const ROUTES = [
  {
    id: 1,
    name: "Маршрут листового металла № 1",
    stations: [
      'Станция 1 - Лазер HFR "С1-Л"',
      'Станция 3 - Участок финишной зачистки "С3-фЗ"',
      'Станция 4 - Гибочный станок FinnPower "ГБFP"',
      'Станция 5 - Слесарный оборонный участок ССБ',
      'Станция 7 - Участок покраски "УП"',
    ]
  },
  {
    id: 2,
    name: "Маршрут листового металла № 2",
    stations: [
      'Станция 2 - Лазер AFR "С2-Л"',
      'Станция 4 - Гибочный станок FinnPower "ГБFP"',
      'Станция 6 - Сварочный участок Пост 1 "СВП1"',
      'Станция 7 - Участок покраски "УП"',
    ]
  }
];

// ========================
//        ПРОЕКТЫ
// ========================
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/projects', (req, res) => {
  const { id, product, startDate, deadline, responsible, status, executors } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Поле id обязательно!" });
  }

  db.query("SELECT id FROM projects WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length > 0) {
      return res.status(400).json({ error: "Проект с таким id уже существует!" });
    }

    db.query(
      'INSERT INTO projects (id, product, startDate, deadline, responsible, status, executors) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, product, startDate, deadline, responsible, status, executors || ""],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: id });
      }
    );
  });
});

// ========================
//        ПОДЗАКАЗЫ
// ========================
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

app.get("/api/suborders", (req, res) => {
  db.query("SELECT * FROM suborders", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// --- ГЕНЕРАЦИЯ НОМЕРА ЗАКАЗА и id ---
app.post("/api/suborders", (req, res) => {
  const { project_id, product, startDate, deadline, responsible, progress } = req.body;

  db.query(
    "SELECT COUNT(*) AS cnt FROM suborders WHERE project_id = ?",
    [project_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const nextIndex = result[0].cnt + 1;
      const subOrderId = `${project_id}-${nextIndex}`; // id и order_number

      db.query(
        "INSERT INTO suborders (id, order_number, project_id, product, startDate, deadline, responsible, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          subOrderId,        // id
          subOrderId,        // order_number
          project_id,
          product,
          startDate,
          deadline,
          responsible,
          progress || 0
        ],
        (err2, results) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true, id: subOrderId, order_number: subOrderId });
        }
      );
    }
  );
});

// ========================
//      СПЕЦИФИКАЦИЯ
// ========================
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

app.get("/api/spec/:suborder_id", (req, res) => {
  db.query(
    "SELECT * FROM spec_batches WHERE suborder_id = ? ORDER BY uploaded_at ASC",
    [req.params.suborder_id],
    (err, batches) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!batches.length) return res.json([]);
      const batchIds = batches.map(b => b.id);
      if (batchIds.length === 0) return res.json([]);
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

// ========================
//        ЗАДАНИЯ
// ========================
app.get("/api/orders", (req, res) => {
  const { project_id, order_id } = req.query;
  if (!project_id || !order_id) return res.status(400).json({ error: "Missing project_id or order_id" });
  db.query(
    "SELECT * FROM orders WHERE project_id = ? AND order_id = ?",
    [project_id, order_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.post("/api/orders", (req, res) => {
  const { project_id, order_id, seq_num, order_number, description, row_ids, route, station, product, priority } = req.body;
  db.query(
    `INSERT INTO orders (project_id, order_id, seq_num, order_number, description, route, station, product, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'В работе')`,
    [project_id, order_id, seq_num, order_number, description, route, station, product, priority],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row_ids?.length) {
        db.query(
          `UPDATE spec_rows SET taskId = ? WHERE id IN (${row_ids.map(() => '?').join(',')})`,
          [order_number, ...row_ids],
          () => res.json({ success: true })
        );
      } else {
        res.json({ success: true });
      }
    }
  );
});

app.get("/api/dispatcher-tasks", (req, res) => {
  db.query(
    "SELECT * FROM orders WHERE status != 'Готов' AND status != 'Закрыт'",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.listen(3001, () => {
  console.log("API сервер запущен на http://localhost:3001");
});
