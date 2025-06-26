import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';
import { MemoryRouter } from 'react-router-dom';

test('muestra error si las contraseñas no coinciden', async () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  // Rellenar todos los campos requeridos
  fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { target: { value: 'juan' } });
  fireEvent.change(screen.getByLabelText(/rut/i), { target: { value: '12345678-9' } });
  fireEvent.change(screen.getByLabelText(/rol/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'abc123' } });
  fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'xyz999' } });

  // Enviar formulario
  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  // Esperar el mensaje de error
  const errorMessage = await screen.findByText(/las contraseñas no coinciden/i);
  expect(errorMessage).toBeInTheDocument();
});
