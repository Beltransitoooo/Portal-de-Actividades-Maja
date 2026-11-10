// Capacidad de trabajo por persona. Regla definida por el negocio (10/11/2026):
// 44 h semanales = lunes a viernes 8 h + sábado 4 h (9–13 h). El domingo se descansa.
export const WEEKDAY_HOURS = 8;
export const SATURDAY_HOURS = 4;
export const WEEKLY_CAPACITY = WEEKDAY_HOURS * 5 + SATURDAY_HOURS;

// "Al límite" a partir del 80 % de la capacidad (la misma proporción que antes: 32 de 40 h).
// Supuesto pendiente de confirmar con el negocio.
export const NEAR_LIMIT_RATIO = 0.8;

// Horas disponibles en un día concreto (objeto Date)
export const dayCapacity = (date) => {
    const dow = date.getDay();
    if (dow === 0) return 0;
    if (dow === 6) return SATURDAY_HOURS;
    return WEEKDAY_HOURS;
};
