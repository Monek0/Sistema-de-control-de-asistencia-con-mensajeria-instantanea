export const getToken = () => {
  return localStorage.getItem('token');
};

export const getEstudiantes = async () => {
  const response = await fetch(process.env.REACT_APP_API_URL + '/api/alumnos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los estudiantes');
  }

  return await response.json();
};

export const createEstudiante = async (form) => {
  const payload = {
    rut_alumno: form.rut,
    nombre_alumno: form.nombre,
    cod_curso: form.cod_curso || null,
    n_celular_apoderado: form.telefono || null,
    correo_alumno: form.correo, // puedes poner form.correo si tienes ese campo
    apoderado: form.apoderado || null,
  };

  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/alumnos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear estudiante');
  }

  return await response.json();
};

// Actualizar estudiante
export const updateEstudiante = async (rut, form) => {
  const payload = {
    nombre_alumno: form.nombre,
    cod_curso: form.cod_curso || null,
    n_celular_apoderado: form.telefono || null,
    correo_alumno: form.correo, // puedes poner form.correo si lo manejas
    apoderado: form.apoderado || null,
  };

  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/alumnos/${rut}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar estudiante');
  }

  return await response.json();
};