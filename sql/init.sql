BEGIN;

CREATE TABLE aseguradoras (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE polizas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_poliza VARCHAR(40) NOT NULL UNIQUE,
    asegurado VARCHAR(150) NOT NULL,
    tipo_seguro VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    suma_asegurada NUMERIC(14, 2) NOT NULL CHECK (suma_asegurada >= 0),
    aseguradora_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT polizas_aseguradora_id_fkey
        FOREIGN KEY (aseguradora_id)
        REFERENCES aseguradoras(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_polizas_fecha_vencimiento
    ON polizas(fecha_vencimiento);

CREATE INDEX idx_polizas_aseguradora_id
    ON polizas(aseguradora_id);

INSERT INTO aseguradoras (nombre) VALUES
    ('Proteccion Nacional'),
    ('Seguros Horizonte'),
    ('Confianza Patrimonial')
ON CONFLICT (nombre) DO NOTHING;

COMMIT;
