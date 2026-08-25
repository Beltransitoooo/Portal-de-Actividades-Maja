// src/services/authService.js

// Definimos la URL base. Más adelante podemos moverla a un archivo .env
const API_URL = "http://localhost:8000"; 

export const loginService = async (username, password) => {
    // Transformamos los datos al formato que espera FastAPI
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
    }

    // Retorna el objeto { access_token: "...", token_type: "bearer" }
    const data = await response.json();
    return data; 
};