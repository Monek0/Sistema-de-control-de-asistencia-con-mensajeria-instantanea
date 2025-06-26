import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';
import { MemoryRouter } from 'react-router-dom';

test('muestra error si algún campo está vacío', async () => {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  // Solo rellenamos un campo
  fireEvent.change(screen.getByLabelText(/nombre de usuario/i), {
    target: { value: 'Juan' },
  });

  fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

  const errorMessage = await screen.findByText(/rellena todos los campos/i);
  expect(errorMessage).toBeInTheDocument();
});
