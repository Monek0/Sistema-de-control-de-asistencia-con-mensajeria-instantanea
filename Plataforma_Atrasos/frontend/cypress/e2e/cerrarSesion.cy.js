describe('Inicio y cierre de sesión', () => {
  it('Usuario 123 inicia sesión y luego cierra sesión correctamente', () => {
    cy.visit('http://localhost:3001/login');

    // Paso 1: Login
    cy.get('input[placeholder="Ej: 12.345.678-9"]').type('123');
    cy.get('input[placeholder="Ingresa tu contraseña"]').type('12345678');
    cy.get('button').contains('Iniciar Sesión').click();

    // Paso 2: Confirmar que está en el dashboard
    cy.contains('Bienvenido').should('exist');

    // Paso 3: Clic en el nombre de usuario (abre dropdown)
    cy.get('div').contains('▼').click();

    // Paso 4: Clic en "Cerrar Sesión"
    cy.contains('div', 'Cerrar Sesión').click();

    // Paso 5: Confirmar redirección a login
    cy.url().should('include', '/login');
    cy.get('button').contains('Iniciar Sesión').should('exist');
  });
});
