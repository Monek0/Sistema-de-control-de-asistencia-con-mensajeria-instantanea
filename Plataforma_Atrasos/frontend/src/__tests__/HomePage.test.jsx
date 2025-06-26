import { render, screen } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { MemoryRouter } from 'react-router-dom';

test('muestra el texto Bienvenido', () => {
  localStorage.setItem('token', 'fakeToken'); // evita redirección
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
});
