CREATE DATABASE f5_rodo;
USE f5_rodo;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT NOT NULL,
    dni VARCHAR(8) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    mail VARCHAR(60) NOT NULL,
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
    PRIMARY KEY (id),
    CONSTRAINT FK_EquiposTorneosEquipos FOREIGN KEY (idEquipo) REFERENCES Equipos(id),
    CONSTRAINT FK_EquiposTorneosTorneos FOREIGN KEY (idTorneo) REFERENCES Torneos(id)
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
    id INT AUTO_INCREMENT NOT NULL,
    idCancha INT NOT NULL,
    idUsuario INT NOT NULL,
    idUsuarioCompartido INT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL,
    precio INT NOT NULL,
    buscandoRival TINYINT(1) NOT NULL,
    parrilla TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_TurnosCanchas FOREIGN KEY (idCancha) REFERENCES Canchas(id),
    CONSTRAINT FK_TurnosUsuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(id),
    CONSTRAINT FK_TurnosUsuariosCompartido FOREIGN KEY (idUsuarioCompartido) REFERENCES Usuarios(id)
);

CREATE TABLE EquiposUsuarios (
    id INT AUTO_INCREMENT NOT NULL,
    idUsuario INT NOT NULL,
    idEquipo INT NOT NULL,
    capitan TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_EquiposUsuariosUsuarios FOREIGN KEY (idUsuario) REFERENCES Usuarios(id),
    CONSTRAINT FK_EquiposUsuariosEquipos FOREIGN KEY (idEquipo) REFERENCES Equipos(id)
);

CREATE TABLE PartidosTorneo (
    id INT AUTO_INCREMENT NOT NULL,
    idEquipo1 INT NOT NULL,
    idEquipo2 INT NOT NULL,
    idTorneo INT NOT NULL,
    resultado VARCHAR(30) NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_PartidosTorneoEquipos1 FOREIGN KEY (idEquipo1) REFERENCES Equipos(id),
    CONSTRAINT FK_PartidosTorneoEquipos2 FOREIGN KEY (idEquipo2) REFERENCES Equipos(id),
    CONSTRAINT FK_PartidosTorneoTorneos FOREIGN KEY (idTorneo) REFERENCES Torneos(id)
);
