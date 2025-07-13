import React from "react";

// Компонент подсветки статуса
function StatusCell({ value }) {
  let bg = "#181870"; // default "В работе"
  let color = "#fff";

  if (value === "Готово") {
    bg = "#1ebf31";
    color = "#fff";
  } else if (value === "Делать") {
    bg = "#baba43";
    color = "#fff";
  } else if (value === "В работе") {
    bg = "#181870";
    color = "#fff";
  }

  return (
    <div
      style={{
        background: bg,
        color,
        borderBottom: "1px solid #444",
        width: "100%",
        minWidth: 0,
        textAlign: "center",
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: "1px",
        padding: "7px 0",
        borderRadius: 0,
      }}
    >
      {value}
    </div>
  );
}

// Пример данных
const rows = [
  { status: "Готово" },
  { status: "Готово" },
  { status: "В работе" },
  { status: "Делать" },
  { status: "Делать" },
  { status: "В работе" },
  { status: "В работе" },
  { status: "В работе" },
  { status: "В работе" },
];

export default function StatusTable() {
  return (
    <table style={{ width: 120, borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th
            style={{
              background: "#232b33",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              padding: "7px 0",
              border: "none",
            }}
          >
            Статус
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td style={{ padding: 0, border: "none" }}>
              <StatusCell value={row.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
