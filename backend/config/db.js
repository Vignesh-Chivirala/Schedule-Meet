import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


db.connect()
  .then(() => {
    console.log("Connected to Supabase PostgreSQL");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
  });

export default db;