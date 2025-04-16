export const login = async (rutUsername, contrasena) => {
    const response = await fetch(process.env.REACT_APP_API_URL + '/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rutUsername, contrasena })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.message || 'Error en la autenticación');
    }
};

export const register = async ({ nombreUsuario, rutUsername, contrasena, codRol }) => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreUsuario,
                rutUsername,
                contrasena,
                codRol,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el registro');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message || 'Error en el registro');
    }
};
