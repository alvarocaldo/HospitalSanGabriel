USE HospitalSanGabriel;
GO

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria)
INSERT INTO dbo.Categoria (nombre, descripcion) VALUES
('Medicamentos',                      'Medicamentos de uso hospitalario'),
('Material Médico',                    'Material e insumos médicos'),
('Material de Laboratorio',            'Reactivos e insumos de laboratorio'),
('Productos de Limpieza Hospitalaria', 'Productos de aseo y desinfección');
GO

-- ------------------------------------------------------------
-- Áreas hospitalarias
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.AreaHospitalaria)
INSERT INTO dbo.AreaHospitalaria (nombre) VALUES
('Emergencia'),
('Hospitalización'),
('Consultorios Externos'),
('Laboratorio');
GO

-- ------------------------------------------------------------
-- Usuario admin
-- Hash bcrypt de la contraseña 'admin123'.
-- Para generar otro hash: python generar_hash.py
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE username = 'admin')
INSERT INTO dbo.Usuario (username, password_hash, nombre_completo, rol, activo)
VALUES ('admin', '$2b$12$fLmQu.umnvTJZPIv082SEu91/vilqRQGmuhR9welfzGft5rRYUNae', 'Administrador del Sistema', 'ADMIN', 1);
GO

-- ------------------------------------------------------------
-- Productos de ejemplo (stock inicia en 0: se llena con entradas)
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Producto)
BEGIN
    DECLARE @id_med  INT = (SELECT id_categoria FROM dbo.Categoria WHERE nombre = 'Medicamentos');
    DECLARE @id_mat  INT = (SELECT id_categoria FROM dbo.Categoria WHERE nombre = 'Material Médico');
    DECLARE @id_lab  INT = (SELECT id_categoria FROM dbo.Categoria WHERE nombre = 'Material de Laboratorio');
    DECLARE @id_limp INT = (SELECT id_categoria FROM dbo.Categoria WHERE nombre = 'Productos de Limpieza Hospitalaria');

    INSERT INTO dbo.Producto
        (codigo, nombre, descripcion, id_categoria, unidad_medida,
         precio_unitario, stock_actual, stock_minimo, maneja_lote, fecha_vencimiento, activo)
    VALUES
    ('MED-001', 'Paracetamol 500mg',        'Tabletas',      @id_med,  'Caja x 100',  25.50, 0, 20, 1, NULL,         1),
    ('MED-002', 'Ibuprofeno 400mg',         'Tabletas',      @id_med,  'Caja x 100',  32.00, 0, 15, 1, NULL,         1),
    ('MAT-001', 'Guantes de nitrilo M',     'Caja x 100',    @id_mat,  'Caja',        45.00, 0, 10, 0, '2027-12-31', 1),
    ('MAT-002', 'Mascarilla quirúrgica',    'Caja x 50',     @id_mat,  'Caja',        18.00, 0, 20, 0, '2027-06-30', 1),
    ('LAB-001', 'Reactivo glucosa',         'Frasco 500ml',  @id_lab,  'Frasco',      89.90, 0,  5, 1, NULL,         1),
    ('LIM-001', 'Desinfectante hospitalario','Galón 4L',     @id_limp, 'Galón',       55.00, 0,  8, 0, '2028-01-31', 1);
END
GO


USE HospitalSanGabriel;
GO

UPDATE dbo.Usuario 
SET password_hash = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW' 
WHERE username = 'admin';


USE HospitalSanGabriel;
GO

UPDATE dbo.Usuario 
SET password_hash = '$2b$12$czvNLEwOSGovPm1hJCiaduHG7WLCWxlWamPF46St7wIUajrqWPyoq' 
WHERE username = 'admin';

-- Verifica que se guardó
SELECT username, password_hash FROM dbo.Usuario WHERE username = 'admin';


SELECT * FROM dbo.Producto;
