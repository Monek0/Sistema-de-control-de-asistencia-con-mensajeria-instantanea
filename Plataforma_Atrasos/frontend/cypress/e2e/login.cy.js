describe('Inicio de sesión y acceso a Control de Atrasos', () => {
  it('Usuario 123 inicia sesión y navega al módulo de Control de Atrasos', () => {
    cy.visit('http://localhost:3001/login');

    // Paso 1: Login
    cy.get('input[placeholder="Ej: 12.345.678-9"]').type('123');
    cy.get('input[placeholder="Ingresa tu contraseña"]').type('12345678');
    cy.get('button').contains('Iniciar Sesión').click();

  });
});
