const express = require("express");
const helmet = require("helmet");
const db = require("./db");
const aseguradorasRouter = require("./routes/aseguradoras");
const polizasRouter = require("./routes/polizas");

const app = express();

app.use(helmet());
app.use(express.json());
app.use("/api/aseguradoras", aseguradorasRouter);
app.use("/api/polizas", polizasRouter);
app.use(express.static("public"));

app.get("/api/health", async (request, response, next) => {
  try {
    const result = await db.query("SELECT NOW() AS database_time");

    response.json({
      status: "ok",
      database: "connected",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({
    error: "Ocurrió un error interno en el servidor.",
  });
});

module.exports = app;
