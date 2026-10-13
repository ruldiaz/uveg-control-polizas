require("dotenv").config();

const app = require("./src/app");
const db = require("./src/db");

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("PostgreSQL conectado correctamente.");

    const server = app.listen(port, host, () => {
      console.log(`Servidor disponible en http://${host}:${port}`);
    });

    process.on("SIGTERM", async () => {
      await db.close();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor.", error);
    process.exit(1);
  }
}

startServer();
