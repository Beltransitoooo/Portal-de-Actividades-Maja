// Jornada del equipo. Regla definida por el negocio (10/11/2026):
//   Lunes a viernes: entrada 9:00, comida de 14:00 a 15:00 y salida 17:00  → 7 h
//   Sábado: 9:00 a 14:00                                                   → 5 h
//   Domingo: descanso
// Capacidad semanal = 5 × 7 + 5 = 40 h. Esta es la única fuente del horario: el reparto de horas,
// el calendario, el cronograma, Mi día y el Panel de rendimiento salen de aquí.
export const WORKDAY = { start: 9, lunchStart: 14, lunchEnd: 15, end: 17 };
export const SATURDAY = { start: 9, end: 14 };

export const WEEKDAY_HOURS = (WORKDAY.end - WORKDAY.start) - (WORKDAY.lunchEnd - WORKDAY.lunchStart); // 7
export const SATURDAY_HOURS = SATURDAY.end - SATURDAY.start; // 5
export const WEEKLY_CAPACITY = WEEKDAY_HOURS * 5 + SATURDAY_HOURS; // 40

// "Al límite" a partir del 80 % de la capacidad (32 de 40 h, como en el diseño original)
export const NEAR_LIMIT_RATIO = 0.8;

// Horas disponibles en un día concreto (objeto Date)
export const dayCapacity = (date) => {
    const dow = date.getDay();
    if (dow === 0) return 0;
    if (dow === 6) return SATURDAY_HOURS;
    return WEEKDAY_HOURS;
};

// Textos del horario para la interfaz
export const WEEKDAY_SCHEDULE_TEXT = `${WORKDAY.start}:00–${WORKDAY.lunchStart}:00 y ${WORKDAY.lunchEnd}:00–${WORKDAY.end}:00`;
export const SATURDAY_SCHEDULE_TEXT = `${SATURDAY.start}:00–${SATURDAY.end}:00`;
export const SATURDAY_SHORT_TEXT = `${SATURDAY.start}–${SATURDAY.end} h`;
export const CAPACITY_SUMMARY = `${WEEKDAY_HOURS} h de lunes a viernes, ${SATURDAY_HOURS} h el sábado; ${WEEKLY_CAPACITY} h por semana`;

// Horario del día para mostrarlo (vacío en domingo)
export const scheduleText = (date) => {
    const dow = date.getDay();
    if (dow === 0) return '';
    return dow === 6 ? SATURDAY_SCHEDULE_TEXT : WEEKDAY_SCHEDULE_TEXT;
};
