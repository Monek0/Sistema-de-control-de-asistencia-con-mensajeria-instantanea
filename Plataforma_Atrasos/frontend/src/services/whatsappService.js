export const sendGlobalMessage = async (data) => {
  const response = await fetch(process.env.REACT_APP_API_URL + '/api/global-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error al enviar mensaje');
  }
  return await response.json();
};