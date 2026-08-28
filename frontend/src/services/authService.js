const API_URL = "http://localhost:8000"; 

export const loginService = async (username, password) => {
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

    const data = await response.json();
    return data; 
};


export const registerService = async (nameUsers, email, password) => {   
    const response = await fetch(`${API_URL}/auth/registrar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            name_users: nameUsers, // <-- Campo requerido por la actualización del backend
            usuario: email, 
            contrasena: password 
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo completar el registro. Intenta con otro correo.");
    }

    return await response.json();
};