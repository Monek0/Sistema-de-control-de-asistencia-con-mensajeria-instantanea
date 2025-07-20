export const getCursos = async () => {
  const response = await fetch(process.env.REACT_APP_API_URL + '/api/cursos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error al obtener los cursos');
    }

    return await response.json();
};