function getLocalDate(hoy = new Date()) {
  return (
    hoy.getFullYear() +
    '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(hoy.getDate()).padStart(2, '0')
  );
}

export { getLocalDate };
