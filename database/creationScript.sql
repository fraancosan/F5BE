CREATE DATABASE f5_rodo;
USE f5_rodo;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT NOT NULL,
    dni VARCHAR(8) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    mail VARCHAR(60) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL,
    contraseña VARCHAR(60) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'usuario',
    PRIMARY KEY (id)
);

CREATE TABLE Canchas (
    id INT AUTO_INCREMENT NOT NULL,
    disponible TINYINT(1) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Equipos (
    id INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    linkInvitacion VARCHAR(255) NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE Torneos (
    id INT AUTO_INCREMENT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NULL,
    precioInscripcion INT NULL,
    cantidadEquipos INT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE EquiposTorneos (
    id INT AUTO_INCREMENT NOT NULL,
    idEquipo INT NOT NULL,
    idTorneo INT NOT NULL,
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idMP VARCHAR(255) DEFAULT NULL,
    urlPreferenciaPago VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    CONSTRAINT unique_equipo_torneo UNIQUE (idEquipo, idTorneo),
    CONSTRAINT FK_EquiposTorneosEquipos FOREIGN KEY (idEquipo) REFERENCES Equipos(id) ON DELETE CASCADE,
    CONSTRAINT FK_EquiposTorneosTorneos FOREIGN KEY (idTorneo) REFERENCES Torneos(id) ON DELETE CASCADE
);

CREATE TABLE Muro (
    id INT AUTO_INCREMENT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    noticia TEXT NOT NULL,
    fecha DATE NOT NULL,
    fechaFin DATE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Politicas (
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(50) NOT NULL,
    PRIMARY KEY (nombre)
);

CREATE TABLE Turnos (
    id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
    idCancha INT NULL,
    idUsuario INT NOT NULL,
    idUsuarioCompartido INT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL,
    precio INT NOT NULL,
    precioSeña INT NOT NULL,
    buscandoRival TINYINT(1) NOT NULL,
    parrilla TINYINT(1) NOT NULL,
    fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaUsuarioCompartido DATETIME NULL,
    idMP VARCHAR(255) DEFAULT NULL,
    idMPCompartido VARCHAR(255) DEFAULT NULL,
    urlPreferenciaPago VARCHAR(255) DEFAULT NULL,
    urlPreferenciaPagoCompartido VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_TurnosCanchas FOREIGN KEY (idCancha) REFERENCES Canchas(id) ON DELETE SET NULL,
    CONSTRAINT FK_TurnosUsuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_TurnosUsuariosCompartido FOREIGN KEY (idUsuarioCompartido) REFERENCES Usuarios(id) ON DELETE SET NULL
);

CREATE TABLE EquiposUsuarios (
    id INT AUTO_INCREMENT NOT NULL,
    idUsuario INT NOT NULL,
    idEquipo INT NOT NULL,
    capitan TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_EquiposUsuariosUsuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_EquiposUsuariosEquipos FOREIGN KEY (idEquipo) REFERENCES Equipos(id) ON DELETE CASCADE,
    CONSTRAINT unique_equipo_usuario UNIQUE (idEquipo, idUsuario)
);

CREATE TABLE PartidosTorneo (
    id INT AUTO_INCREMENT NOT NULL,
    idEquipo1 INT NULL,
    idEquipo2 INT NULL,
    idTorneo INT NOT NULL,
    resultado VARCHAR(30) NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_PartidosTorneoEquipos1 FOREIGN KEY (idEquipo1) REFERENCES Equipos(id) ON DELETE SET NULL,
    CONSTRAINT FK_PartidosTorneoEquipos2 FOREIGN KEY (idEquipo2) REFERENCES Equipos(id) ON DELETE SET NULL,
    CONSTRAINT FK_PartidosTorneoTorneos FOREIGN KEY (idTorneo) REFERENCES Torneos(id)
);
