import "dotenv/config";
import mysql from "mysql2/promise";
import process from "node:process";

const { DB_HOST = "localhost", DB_PORT = "3306", DB_USER, DB_PASSWORD = "", DB_NAME } = process.env;

if (!DB_USER || !DB_NAME) {
  throw new Error("Définissez DB_USER et DB_NAME dans le fichier .env.");
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

export default pool;
