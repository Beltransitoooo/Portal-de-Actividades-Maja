// Iniciales para avatares: primera letra de las dos primeras palabras ("Tester Uno" → "TU");
// con una sola palabra, sus dos primeras letras ("Tester" → "TE").
export const getInitials = (name) => {
    if (!name || !name.trim()) return 'US';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
};
