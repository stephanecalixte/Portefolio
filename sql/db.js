import "dotenv/config";
import mariadb from "mariadb";
import process from "node:process";

const { DB_HOST = "localhost", DB_PORT = "3306", DB_USER, DB_PASSWORD = "", DB_NAME } = process.env;
const port = Number(DB_PORT);

if (!DB_USER || !DB_NAME) {
  throw new Error("Définissez DB_USER et DB_NAME dans le fichier .env.");
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT doit être un port valide compris entre 1 et 65535.");
}

const connectionPool = mariadb.createPool({
  host: DB_HOST,
  port,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10,
  connectTimeout: 5000,
  bigIntAsNumber: true,
});

const pool = {
  async query(sql, parameters) {
    return [await connectionPool.query(sql, parameters)];
  },
  async execute(sql, parameters) {
    return [await connectionPool.execute(sql, parameters)];
  },
  end() {
    return connectionPool.end();
  },
};

export default pool;
