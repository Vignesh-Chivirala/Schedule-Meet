import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

function ensureSchema() {
  const columnChecks = [
    {
      table: "events",
      column: "buffer_before",
      definition: "INT DEFAULT 0",
    },
    {
      table: "events",
      column: "buffer_after",
      definition: "INT DEFAULT 0",
    },
    {
      table: "events",
      column: "custom_question",
      definition: "VARCHAR(255) NULL",
    },
    {
      table: "bookings",
      column: "custom_answer",
      definition: "TEXT NULL",
    },
  ];

  columnChecks.forEach(({ table, column, definition }) => {
    db.query(
      `
        SELECT COUNT(*) AS count
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [table, column],
      (checkErr, result) => {
        if (checkErr) {
          console.error("Schema sync failed:", checkErr.message);
          return;
        }

        if (result[0]?.count > 0) {
          return;
        }

        db.query(
          `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
          (alterErr) => {
            if (alterErr) {
              console.error("Schema sync failed:", alterErr.message);
            }
          }
        );
      }
    );
  });

  db.query(
    `
      CREATE TABLE IF NOT EXISTS availability_overrides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        override_date DATE NOT NULL,
        start_time TIME NULL,
        end_time TIME NULL,
        is_blocked TINYINT(1) DEFAULT 0,
        UNIQUE KEY unique_event_override (event_id, override_date)
      )
    `,
    (tableErr) => {
      if (tableErr) {
        console.error("Schema sync failed:", tableErr.message);
      }
    }
  );
}

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
  ensureSchema();
});



export default db;
