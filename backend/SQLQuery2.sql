USE HospitalSanGabriel;
GO

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_usuario_login
    @username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_usuario, username, password_hash, nombre_completo, rol, activo
    FROM dbo.Usuario
    WHERE username = @username AND activo = 1;
END
GO

-- ============================================================
-- CATEGORÍAS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_categoria_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_categoria, nombre, descripcion, activo, fecha_creacion
    FROM dbo.Categoria
    WHERE activo = 1
    ORDER BY nombre;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_categoria_crear
    @nombre NVARCHAR(100),
    @descripcion NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = ''
        THROW 50010, 'El nombre de la categoría es obligatorio.', 1;
    IF EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = @nombre)
        THROW 50011, 'Ya existe una categoría con ese nombre.', 1;
    INSERT INTO dbo.Categoria (nombre, descripcion) VALUES (@nombre, @descripcion);
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS id_categoria;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_categoria_actualizar
    @id_categoria INT,
    @nombre NVARCHAR(100),
    @descripcion NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE id_categoria = @id_categoria)
        THROW 50012, 'Categoría no encontrada.', 1;
    IF EXISTS (SELECT 1 FROM dbo.Categoria WHERE nombre = @nombre AND id_categoria <> @id_categoria)
        THROW 50011, 'Ya existe una categoría con ese nombre.', 1;
    UPDATE dbo.Categoria
    SET nombre = @nombre, descripcion = @descripcion
    WHERE id_categoria = @id_categoria;
END
GO

-- ============================================================
-- ÁREAS HOSPITALARIAS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_area_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_area, nombre, activo
    FROM dbo.AreaHospitalaria
    WHERE activo = 1
    ORDER BY nombre;
END
GO

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_producto_crear
    @codigo NVARCHAR(50),
    @nombre NVARCHAR(150),
    @descripcion NVARCHAR(500) = NULL,
    @id_categoria INT,
    @unidad_medida NVARCHAR(50),
    @precio_unitario DECIMAL(18,2),
    @stock_minimo INT,
    @maneja_lote BIT,
    @fecha_vencimiento DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @codigo IS NULL OR LTRIM(RTRIM(@codigo)) = ''
        THROW 50013, 'El código es obligatorio.', 1;
    IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = ''
        THROW 50014, 'El nombre es obligatorio.', 1;
    IF @precio_unitario <= 0
        THROW 50015, 'El precio debe ser mayor que cero.', 1;
    IF @stock_minimo < 0
        THROW 50016, 'El stock mínimo no puede ser negativo.', 1;
    IF EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = @codigo)
        THROW 50017, 'Ya existe un producto con ese código.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE id_categoria = @id_categoria)
        THROW 50012, 'Categoría no encontrada.', 1;

    INSERT INTO dbo.Producto
        (codigo, nombre, descripcion, id_categoria, unidad_medida,
         precio_unitario, stock_minimo, maneja_lote, fecha_vencimiento)
    VALUES
        (@codigo, @nombre, @descripcion, @id_categoria, @unidad_medida,
         @precio_unitario, @stock_minimo, @maneja_lote, @fecha_vencimiento);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_actualizar
    @id_producto INT,
    @codigo NVARCHAR(50),
    @nombre NVARCHAR(150),
    @descripcion NVARCHAR(500) = NULL,
    @id_categoria INT,
    @unidad_medida NVARCHAR(50),
    @precio_unitario DECIMAL(18,2),
    @stock_minimo INT,
    @maneja_lote BIT,
    @fecha_vencimiento DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE id_producto = @id_producto)
        THROW 50002, 'Producto no encontrado.', 1;
    IF @precio_unitario <= 0
        THROW 50015, 'El precio debe ser mayor que cero.', 1;
    IF EXISTS (SELECT 1 FROM dbo.Producto WHERE codigo = @codigo AND id_producto <> @id_producto)
        THROW 50017, 'Ya existe un producto con ese código.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.Categoria WHERE id_categoria = @id_categoria)
        THROW 50012, 'Categoría no encontrada.', 1;

    UPDATE dbo.Producto
    SET codigo = @codigo,
        nombre = @nombre,
        descripcion = @descripcion,
        id_categoria = @id_categoria,
        unidad_medida = @unidad_medida,
        precio_unitario = @precio_unitario,
        stock_minimo = @stock_minimo,
        maneja_lote = @maneja_lote,
        fecha_vencimiento = @fecha_vencimiento,
        fecha_actualizacion = GETDATE()
    WHERE id_producto = @id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_desactivar
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE id_producto = @id_producto)
        THROW 50002, 'Producto no encontrado.', 1;
    UPDATE dbo.Producto
    SET activo = 0, fecha_actualizacion = GETDATE()
    WHERE id_producto = @id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_listar
    @texto NVARCHAR(150) = NULL,
    @id_categoria INT = NULL,
    @solo_activos BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.id_producto, p.codigo, p.nombre, p.descripcion,
           p.id_categoria, c.nombre AS categoria,
           p.unidad_medida, p.precio_unitario,
           p.stock_actual, p.stock_minimo,
           p.maneja_lote, p.fecha_vencimiento, p.activo,
           p.fecha_creacion, p.fecha_actualizacion
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE (@solo_activos = 0 OR p.activo = 1)
      AND (@id_categoria IS NULL OR p.id_categoria = @id_categoria)
      AND (@texto IS NULL OR p.codigo LIKE '%' + @texto + '%' OR p.nombre LIKE '%' + @texto + '%')
    ORDER BY p.nombre;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_obtener
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.id_producto, p.codigo, p.nombre, p.descripcion,
           p.id_categoria, c.nombre AS categoria,
           p.unidad_medida, p.precio_unitario,
           p.stock_actual, p.stock_minimo,
           p.maneja_lote, p.fecha_vencimiento, p.activo
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE p.id_producto = @id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_stock_bajo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
           p.stock_actual, p.stock_minimo, p.unidad_medida
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE p.activo = 1 AND p.stock_actual <= p.stock_minimo
    ORDER BY p.stock_actual ASC, p.nombre;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_proximos_vencer
    @dias INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
           CAST(NULL AS NVARCHAR(50)) AS numero_lote,
           p.fecha_vencimiento,
           DATEDIFF(DAY, CAST(GETDATE() AS DATE), p.fecha_vencimiento) AS dias_para_vencer,
           p.stock_actual, 'PRODUCTO' AS origen
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE p.activo = 1 AND p.maneja_lote = 0
      AND p.fecha_vencimiento IS NOT NULL
      AND p.fecha_vencimiento BETWEEN CAST(GETDATE() AS DATE)
          AND DATEADD(DAY, @dias, CAST(GETDATE() AS DATE))
    UNION ALL
    SELECT p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
           l.numero_lote,
           l.fecha_vencimiento,
           DATEDIFF(DAY, CAST(GETDATE() AS DATE), l.fecha_vencimiento) AS dias_para_vencer,
           l.cantidad_actual AS stock_actual, 'LOTE' AS origen
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    INNER JOIN dbo.LoteProducto l ON l.id_producto = p.id_producto
    WHERE p.activo = 1 AND p.maneja_lote = 1 AND l.activo = 1
      AND l.fecha_vencimiento BETWEEN CAST(GETDATE() AS DATE)
          AND DATEADD(DAY, @dias, CAST(GETDATE() AS DATE))
    ORDER BY fecha_vencimiento;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_producto_vencidos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
           CAST(NULL AS NVARCHAR(50)) AS numero_lote,
           p.fecha_vencimiento,
           DATEDIFF(DAY, p.fecha_vencimiento, CAST(GETDATE() AS DATE)) AS dias_vencido,
           p.stock_actual, 'PRODUCTO' AS origen
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE p.activo = 1 AND p.maneja_lote = 0
      AND p.fecha_vencimiento IS NOT NULL
      AND p.fecha_vencimiento < CAST(GETDATE() AS DATE)
    UNION ALL
    SELECT p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
           l.numero_lote,
           l.fecha_vencimiento,
           DATEDIFF(DAY, l.fecha_vencimiento, CAST(GETDATE() AS DATE)) AS dias_vencido,
           l.cantidad_actual, 'LOTE' AS origen
    FROM dbo.Producto p
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    INNER JOIN dbo.LoteProducto l ON l.id_producto = p.id_producto
    WHERE p.activo = 1 AND p.maneja_lote = 1 AND l.activo = 1 AND l.cantidad_actual > 0
      AND l.fecha_vencimiento < CAST(GETDATE() AS DATE)
    ORDER BY fecha_vencimiento;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_lote_listar_por_producto
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_lote, numero_lote, fecha_vencimiento, cantidad_actual,
           CASE WHEN fecha_vencimiento < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END AS vencido
    FROM dbo.LoteProducto
    WHERE id_producto = @id_producto AND activo = 1 AND cantidad_actual > 0
    ORDER BY fecha_vencimiento;
END
GO

-- ============================================================
-- ENTRADAS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_entrada_registrar
    @id_producto INT,
    @cantidad INT,
    @motivo NVARCHAR(255),
    @id_usuario INT,
    @numero_lote NVARCHAR(50) = NULL,
    @fecha_vencimiento DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @cantidad IS NULL OR @cantidad <= 0
            THROW 50008, 'La cantidad debe ser un entero mayor que cero.', 1;

        IF @motivo IS NULL OR LTRIM(RTRIM(@motivo)) = ''
            THROW 50018, 'El motivo es obligatorio.', 1;

        DECLARE @maneja_lote BIT, @stock_actual INT, @id_lote INT, @stock_anterior INT;

        SELECT @maneja_lote = maneja_lote, @stock_actual = stock_actual
        FROM dbo.Producto
        WHERE id_producto = @id_producto AND activo = 1;

        IF @maneja_lote IS NULL
            THROW 50002, 'Producto no encontrado o inactivo.', 1;

        IF @maneja_lote = 1
        BEGIN
            IF @numero_lote IS NULL OR LTRIM(RTRIM(@numero_lote)) = ''
                THROW 50005, 'El producto maneja lote: debe indicar el número de lote.', 1;
            IF @fecha_vencimiento IS NULL
                THROW 50006, 'El producto maneja lote: debe indicar la fecha de vencimiento del lote.', 1;

            SELECT @id_lote = id_lote
            FROM dbo.LoteProducto
            WHERE id_producto = @id_producto AND numero_lote = @numero_lote;

            IF @id_lote IS NULL
            BEGIN
                INSERT INTO dbo.LoteProducto
                    (id_producto, numero_lote, fecha_vencimiento, cantidad_inicial, cantidad_actual)
                VALUES
                    (@id_producto, @numero_lote, @fecha_vencimiento, @cantidad, @cantidad);
                SET @id_lote = SCOPE_IDENTITY();
            END
            ELSE
            BEGIN
                UPDATE dbo.LoteProducto
                SET cantidad_inicial = cantidad_inicial + @cantidad,
                    cantidad_actual  = cantidad_actual + @cantidad
                WHERE id_lote = @id_lote;
            END
        END

        SET @stock_anterior = @stock_actual;

        UPDATE dbo.Producto
        SET stock_actual = stock_actual + @cantidad,
            fecha_actualizacion = GETDATE()
        WHERE id_producto = @id_producto;

        INSERT INTO dbo.MovimientoInventario
            (id_producto, id_lote, tipo, cantidad, motivo, id_area,
             stock_anterior, stock_posterior, id_usuario)
        VALUES
            (@id_producto, @id_lote, 'ENTRADA', @cantidad, @motivo, NULL,
             @stock_anterior, @stock_anterior + @cantidad, @id_usuario);

        DECLARE @id_movimiento INT = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT @id_movimiento AS id_movimiento, (@stock_anterior + @cantidad) AS nuevo_stock;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ============================================================
-- SALIDAS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_salida_registrar
    @id_producto INT,
    @cantidad INT,
    @motivo NVARCHAR(255),
    @id_area INT,
    @id_usuario INT,
    @id_lote INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @cantidad IS NULL OR @cantidad <= 0
            THROW 50008, 'La cantidad debe ser un entero mayor que cero.', 1;

        IF @motivo IS NULL OR LTRIM(RTRIM(@motivo)) = ''
            THROW 50018, 'El motivo es obligatorio.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.AreaHospitalaria WHERE id_area = @id_area AND activo = 1)
            THROW 50007, 'Área hospitalaria no válida.', 1;

        DECLARE @maneja_lote BIT, @stock_actual INT, @fecha_vencimiento DATE,
                @stock_anterior INT, @id_lote_usado INT;

        SELECT @maneja_lote = maneja_lote,
               @stock_actual = stock_actual,
               @fecha_vencimiento = fecha_vencimiento
        FROM dbo.Producto
        WHERE id_producto = @id_producto AND activo = 1;

        IF @maneja_lote IS NULL
            THROW 50002, 'Producto no encontrado o inactivo.', 1;

        IF @stock_actual < @cantidad
            THROW 50003, 'Stock insuficiente para realizar la salida.', 1;

        IF @maneja_lote = 1
        BEGIN
            IF @id_lote IS NULL
            BEGIN
                -- Selección FEFO: lote más próximo a vencer, no vencido, con stock
                SELECT TOP 1 @id_lote = id_lote
                FROM dbo.LoteProducto
                WHERE id_producto = @id_producto
                  AND activo = 1
                  AND cantidad_actual >= @cantidad
                  AND fecha_vencimiento >= CAST(GETDATE() AS DATE)
                ORDER BY fecha_vencimiento ASC;

                IF @id_lote IS NULL
                    THROW 50006, 'No hay lote disponible con stock suficiente y no vencido.', 1;
            END

            IF NOT EXISTS (SELECT 1 FROM dbo.LoteProducto WHERE id_lote = @id_lote AND id_producto = @id_producto AND activo = 1)
                THROW 50006, 'Lote no válido para el producto.', 1;

            IF EXISTS (SELECT 1 FROM dbo.LoteProducto WHERE id_lote = @id_lote AND fecha_vencimiento < CAST(GETDATE() AS DATE))
                THROW 50004, 'El lote está vencido y no puede usarse para salida hospitalaria.', 1;

            IF EXISTS (SELECT 1 FROM dbo.LoteProducto WHERE id_lote = @id_lote AND cantidad_actual < @cantidad)
                THROW 50003, 'El lote no tiene stock suficiente.', 1;

            UPDATE dbo.LoteProducto
            SET cantidad_actual = cantidad_actual - @cantidad
            WHERE id_lote = @id_lote;

            SET @id_lote_usado = @id_lote;
        END
        ELSE
        BEGIN
            IF @fecha_vencimiento IS NOT NULL AND @fecha_vencimiento < CAST(GETDATE() AS DATE)
                THROW 50004, 'El producto está vencido y no puede usarse para salida hospitalaria.', 1;
            SET @id_lote_usado = NULL;
        END

        SET @stock_anterior = @stock_actual;

        UPDATE dbo.Producto
        SET stock_actual = stock_actual - @cantidad,
            fecha_actualizacion = GETDATE()
        WHERE id_producto = @id_producto;

        INSERT INTO dbo.MovimientoInventario
            (id_producto, id_lote, tipo, cantidad, motivo, id_area,
             stock_anterior, stock_posterior, id_usuario)
        VALUES
            (@id_producto, @id_lote_usado, 'SALIDA', @cantidad, @motivo, @id_area,
             @stock_anterior, @stock_anterior - @cantidad, @id_usuario);

        DECLARE @id_movimiento INT = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT @id_movimiento AS id_movimiento, (@stock_anterior - @cantidad) AS nuevo_stock;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ============================================================
-- HISTORIAL DE MOVIMIENTOS
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_movimiento_listar
    @id_producto INT = NULL,
    @tipo NVARCHAR(10) = NULL,
    @id_area INT = NULL,
    @fecha_desde DATETIME = NULL,
    @fecha_hasta DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.id_movimiento, m.id_producto, p.codigo, p.nombre AS producto,
           c.nombre AS categoria,
           m.id_lote, l.numero_lote,
           m.tipo, m.cantidad, m.fecha, m.motivo,
           m.id_area, a.nombre AS area,
           m.stock_anterior, m.stock_posterior,
           m.id_usuario, u.nombre_completo AS usuario
    FROM dbo.MovimientoInventario m
    INNER JOIN dbo.Producto p ON p.id_producto = m.id_producto
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    LEFT  JOIN dbo.LoteProducto l ON l.id_lote = m.id_lote
    LEFT  JOIN dbo.AreaHospitalaria a ON a.id_area = m.id_area
    INNER JOIN dbo.Usuario u ON u.id_usuario = m.id_usuario
    WHERE (@id_producto IS NULL OR m.id_producto = @id_producto)
      AND (@tipo IS NULL OR m.tipo = @tipo)
      AND (@id_area IS NULL OR m.id_area = @id_area)
      AND (@fecha_desde IS NULL OR m.fecha >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR m.fecha <= @fecha_hasta)
    ORDER BY m.fecha DESC, m.id_movimiento DESC;
END
GO

-- ============================================================
-- INDICADORES / REPORTES
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_dashboard_indicadores
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM dbo.Producto WHERE activo = 1) AS productos_activos,
        (SELECT COUNT(*) FROM dbo.Producto WHERE activo = 1 AND stock_actual <= stock_minimo) AS productos_stock_bajo,
        (SELECT COUNT(*) FROM dbo.Producto
            WHERE activo = 1 AND maneja_lote = 0 AND fecha_vencimiento IS NOT NULL
              AND fecha_vencimiento BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 30, CAST(GETDATE() AS DATE)))
      + (SELECT COUNT(*) FROM dbo.LoteProducto l
            INNER JOIN dbo.Producto p ON p.id_producto = l.id_producto
            WHERE p.activo = 1 AND l.activo = 1
              AND l.fecha_vencimiento BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 30, CAST(GETDATE() AS DATE))) AS productos_proximos_vencer,
        (SELECT COUNT(*) FROM dbo.Producto
            WHERE activo = 1 AND maneja_lote = 0 AND fecha_vencimiento IS NOT NULL
              AND fecha_vencimiento < CAST(GETDATE() AS DATE))
      + (SELECT COUNT(*) FROM dbo.LoteProducto l
            INNER JOIN dbo.Producto p ON p.id_producto = l.id_producto
            WHERE p.activo = 1 AND l.activo = 1 AND l.cantidad_actual > 0
              AND l.fecha_vencimiento < CAST(GETDATE() AS DATE)) AS productos_vencidos,
        (SELECT ISNULL(SUM(p.stock_actual * p.precio_unitario), 0)
            FROM dbo.Producto p WHERE p.activo = 1) AS valor_inventario,
        (SELECT COUNT(*) FROM dbo.MovimientoInventario
            WHERE fecha >= DATEADD(DAY, -30, GETDATE())) AS movimientos_ultimos_30_dias;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_productos_mayores_salidas
    @fecha_desde DATETIME,
    @fecha_hasta DATETIME,
    @top_n INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@top_n)
        p.id_producto, p.codigo, p.nombre, c.nombre AS categoria,
        SUM(m.cantidad) AS total_salidas
    FROM dbo.MovimientoInventario m
    INNER JOIN dbo.Producto p ON p.id_producto = m.id_producto
    INNER JOIN dbo.Categoria c ON c.id_categoria = p.id_categoria
    WHERE m.tipo = 'SALIDA'
      AND m.fecha BETWEEN @fecha_desde AND @fecha_hasta
    GROUP BY p.id_producto, p.codigo, p.nombre, c.nombre
    ORDER BY total_salidas DESC;
END
GO