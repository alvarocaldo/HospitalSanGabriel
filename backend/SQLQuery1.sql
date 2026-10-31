-- ============================================================
-- Hospital San Gabriel - Esquema de base de datos
-- ============================================================
IF DB_ID('HospitalSanGabriel') IS NULL
    CREATE DATABASE HospitalSanGabriel;
GO
USE HospitalSanGabriel;
GO

-- ------------------------------------------------------------
-- Categoría
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Categoria','U') IS NULL
CREATE TABLE dbo.Categoria (
    id_categoria   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre         NVARCHAR(100) NOT NULL,
    descripcion    NVARCHAR(255) NULL,
    activo         BIT NOT NULL CONSTRAINT DF_Categoria_activo DEFAULT (1),
    fecha_creacion DATETIME NOT NULL CONSTRAINT DF_Categoria_fecha DEFAULT (GETDATE()),
    CONSTRAINT UQ_Categoria_nombre UNIQUE (nombre)
);
GO

-- ------------------------------------------------------------
-- Usuario
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Usuario','U') IS NULL
CREATE TABLE dbo.Usuario (
    id_usuario      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username        NVARCHAR(50) NOT NULL,
    password_hash   NVARCHAR(255) NOT NULL,
    nombre_completo NVARCHAR(150) NOT NULL,
    rol             NVARCHAR(30) NOT NULL CONSTRAINT DF_Usuario_rol DEFAULT ('ADMIN'),
    activo          BIT NOT NULL CONSTRAINT DF_Usuario_activo DEFAULT (1),
    fecha_creacion  DATETIME NOT NULL CONSTRAINT DF_Usuario_fecha DEFAULT (GETDATE()),
    CONSTRAINT UQ_Usuario_username UNIQUE (username)
);
GO

-- ------------------------------------------------------------
-- Área hospitalaria (destino de salidas)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.AreaHospitalaria','U') IS NULL
CREATE TABLE dbo.AreaHospitalaria (
    id_area INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre  NVARCHAR(100) NOT NULL,
    activo  BIT NOT NULL CONSTRAINT DF_Area_activo DEFAULT (1),
    CONSTRAINT UQ_Area_nombre UNIQUE (nombre)
);
GO

-- ------------------------------------------------------------
-- Producto
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.Producto','U') IS NULL
CREATE TABLE dbo.Producto (
    id_producto         INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    codigo              NVARCHAR(50) NOT NULL,
    nombre              NVARCHAR(150) NOT NULL,
    descripcion         NVARCHAR(500) NULL,
    id_categoria        INT NOT NULL,
    unidad_medida       NVARCHAR(50) NOT NULL,
    precio_unitario     DECIMAL(18,2) NOT NULL,
    stock_actual        INT NOT NULL CONSTRAINT DF_Producto_stock DEFAULT (0),
    stock_minimo        INT NOT NULL CONSTRAINT DF_Producto_stockmin DEFAULT (0),
    maneja_lote         BIT NOT NULL CONSTRAINT DF_Producto_lote DEFAULT (0),
    fecha_vencimiento   DATE NULL,
    activo              BIT NOT NULL CONSTRAINT DF_Producto_activo DEFAULT (1),
    fecha_creacion      DATETIME NOT NULL CONSTRAINT DF_Producto_fecha DEFAULT (GETDATE()),
    fecha_actualizacion DATETIME NULL,
    CONSTRAINT UQ_Producto_codigo   UNIQUE (codigo),
    CONSTRAINT CK_Producto_precio   CHECK (precio_unitario > 0),
    CONSTRAINT CK_Producto_stock    CHECK (stock_actual >= 0),
    CONSTRAINT CK_Producto_stockmin CHECK (stock_minimo >= 0),
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (id_categoria)
        REFERENCES dbo.Categoria(id_categoria)
);
GO

-- ------------------------------------------------------------
-- Lote de producto
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.LoteProducto','U') IS NULL
CREATE TABLE dbo.LoteProducto (
    id_lote           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_producto       INT NOT NULL,
    numero_lote       NVARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial  INT NOT NULL,
    cantidad_actual   INT NOT NULL,
    activo            BIT NOT NULL CONSTRAINT DF_Lote_activo DEFAULT (1),
    fecha_registro    DATETIME NOT NULL CONSTRAINT DF_Lote_fecha DEFAULT (GETDATE()),
    CONSTRAINT UQ_Lote_prod_num   UNIQUE (id_producto, numero_lote),
    CONSTRAINT CK_Lote_cant_ini   CHECK (cantidad_inicial > 0),
    CONSTRAINT CK_Lote_cant_act   CHECK (cantidad_actual >= 0),
    CONSTRAINT FK_Lote_Producto FOREIGN KEY (id_producto)
        REFERENCES dbo.Producto(id_producto)
);
GO

-- ------------------------------------------------------------
-- Movimiento de inventario (histórico)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.MovimientoInventario','U') IS NULL
CREATE TABLE dbo.MovimientoInventario (
    id_movimiento   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_producto     INT NOT NULL,
    id_lote         INT NULL,
    tipo            NVARCHAR(10) NOT NULL,
    cantidad        INT NOT NULL,
    fecha           DATETIME NOT NULL CONSTRAINT DF_Mov_fecha DEFAULT (GETDATE()),
    motivo          NVARCHAR(255) NOT NULL,
    id_area         INT NULL,
    stock_anterior  INT NOT NULL,
    stock_posterior INT NOT NULL,
    id_usuario      INT NOT NULL,
    CONSTRAINT CK_Mov_tipo     CHECK (tipo IN ('ENTRADA','SALIDA')),
    CONSTRAINT CK_Mov_cantidad CHECK (cantidad > 0),
    CONSTRAINT FK_Mov_Producto FOREIGN KEY (id_producto)
        REFERENCES dbo.Producto(id_producto),
    CONSTRAINT FK_Mov_Lote FOREIGN KEY (id_lote)
        REFERENCES dbo.LoteProducto(id_lote),
    CONSTRAINT FK_Mov_Area FOREIGN KEY (id_area)
        REFERENCES dbo.AreaHospitalaria(id_area),
    CONSTRAINT FK_Mov_Usuario FOREIGN KEY (id_usuario)
        REFERENCES dbo.Usuario(id_usuario)
);
GO