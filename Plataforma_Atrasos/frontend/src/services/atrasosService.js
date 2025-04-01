export const getAtrasos = async () => {
    const response = await fetch(process.env.REACT_APP_API_URL + '/api/atrasos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error al obtener los atrasos');
    }

    return await response.json();
};

export const createAtraso = async (atrasoData) => {
    const response = await fetch(process.env.REACT_APP_API_URL + '/api/atrasos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(atrasoData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el atraso');
    }

    return await response.json();
};
