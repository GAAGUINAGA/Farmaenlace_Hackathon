/** Hora local HH:MM:SS (24 h) de una marca ISO. */
export const eventTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-EC", { hour12: false });
