import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';

test('muestra error si los campos están vacíos', () => {
  render(<LoginPage />);
  const boton = screen.getByRole('button', { name: /iniciar sesión/i });
  fireEvent.click(boton);
  expect(screen.getByText(/completa todos los campos/i)).toBeInTheDocument();
});
