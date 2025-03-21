export const login = async (rutUsername, contraseña) => {
    const response = await fetch('https://t7ygzclsbsxdxg5gpnqjrdgaxe0ywkxz.lambda-url.us-east-2.on.aws/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rutUsername, contraseña })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.message || 'Error en la autenticación');
    }
};

export const register = async ({ nombreUsuario, rutUsername, contraseña, codRol }) => {
    try {
        const response = await fetch('https://t7ygzclsbsxdxg5gpnqjrdgaxe0ywkxz.lambda-url.us-east-2.on.aws/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombreUsuario,
                rutUsername,
                contraseña,
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
