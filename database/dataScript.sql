USE f5_rodo;

INSERT INTO Canchas (id, disponible) VALUES
(4, 1),
(6, 0);

INSERT INTO Equipos (id, nombre) VALUES
(3, 'nocheros'),
(2, 'sacachispas');

INSERT INTO Torneos (id, descripcion, fechaInicio, fechaFin, precioInscripcion, cantidadEquipos) VALUES
(1, 'Torneo fin de año', '2024-11-05', '2025-01-05', 40000, 16);

INSERT INTO EquiposTorneos (id, idEquipo, idTorneo) VALUES
(1, 3, 1),
(2, 2, 1);

INSERT INTO Muro (id, titulo, noticia, fecha, fechaFin) VALUES
(24, 'Suspendido', 'Estimados Usuarios, Se suspende las reservas del día de la fecha debido a situaciones climáticas fuera de nuestro alcance. Sepan comprender. Saludos.', '2024-07-14', '2024-08-14');

INSERT INTO Politicas (nombre, descripcion) VALUES
('horaAbre', '8:00'),
('horaCierra', '20:00'),
('descuentoPremium', '0.8'),
('reservasNecesariasPremium', '6'),
('precioTurno', '30000'),
('porcentajeSeña', '0.4'),
('precioParrilla', '2500');

INSERT INTO PartidosTorneo (id, idEquipo1, idEquipo2, idTorneo, resultado, fecha) VALUES
(1, 2, 3, 1, '5-2', '2024-11-10');
