const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../db");

const router = express.Router();

function sendValidationErrors(request, response, next) {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({
      error: "Los datos de la póliza no son válidos.",
      details: errors.array(),
    });
  }

  next();
}

router.get("/", async (request, response, next) => {
  try {
    const result = await db.query(`
      SELECT
        polizas.id,
        polizas.numero_poliza AS "numeroPoliza",
        polizas.asegurado,
        polizas.tipo_seguro AS "tipoSeguro",
        polizas.fecha_vencimiento AS "fechaVencimiento",
        polizas.suma_asegurada AS "sumaAsegurada",
        aseguradoras.id AS "aseguradoraId",
        aseguradoras.nombre AS aseguradora
      FROM polizas
      INNER JOIN aseguradoras ON aseguradoras.id = polizas.aseguradora_id
      ORDER BY polizas.fecha_vencimiento ASC, polizas.id DESC
    `);

    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("numeroPoliza").trim().isLength({ min: 1, max: 40 }),
    body("asegurado").trim().isLength({ min: 1, max: 150 }),
    body("tipoSeguro").trim().isLength({ min: 1, max: 50 }),
    body("fechaVencimiento").isISO8601(),
    body("sumaAsegurada").isFloat({ min: 0 }),
    body("aseguradoraId").isInt({ min: 1 }),
  ],
  sendValidationErrors,
  async (request, response, next) => {
    const {
      numeroPoliza,
      asegurado,
      tipoSeguro,
      fechaVencimiento,
      sumaAsegurada,
      aseguradoraId,
    } = request.body;

    try {
      const result = await db.query(
        `
          INSERT INTO polizas (
            numero_poliza,
            asegurado,
            tipo_seguro,
            fecha_vencimiento,
            suma_asegurada,
            aseguradora_id
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
        [
          numeroPoliza.trim(),
          asegurado.trim(),
          tipoSeguro.trim(),
          fechaVencimiento,
          sumaAsegurada,
          aseguradoraId,
        ],
      );

      response.status(201).json({
        id: result.rows[0].id,
        message: "Póliza registrada correctamente.",
      });
    } catch (error) {
      if (error.code === "23505") {
        return response.status(409).json({
          error: "El número de póliza ya está registrado.",
        });
      }

      if (error.code === "23503") {
        return response.status(400).json({
          error: "La aseguradora seleccionada no existe.",
        });
      }

      next(error);
    }
  },
);

router.delete(
  "/:id",
  [param("id").isInt({ min: 1 })],
  sendValidationErrors,
  async (request, response, next) => {
    try {
      const result = await db.query(
        "DELETE FROM polizas WHERE id = $1 RETURNING id",
        [request.params.id],
      );

      if (!result.rowCount) {
        return response.status(404).json({
          error: "La póliza no existe.",
        });
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
