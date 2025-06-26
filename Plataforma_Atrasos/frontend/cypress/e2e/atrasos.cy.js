describe('Inicio de sesión y acceso a Control de Atrasos', () => {
  it('Usuario 123 inicia sesión y navega al módulo de Control de Atrasos', () => {
    cy.visit('http://localhost:3001/login');

    // Paso 1: Login
    cy.get('input[placeholder="Ej: 12.345.678-9"]').type('123');
    cy.get('input[placeholder="Ingresa tu contraseña"]').type('12345678');
    cy.get('button').contains('Iniciar Sesión').click();

    // Paso 2: Esperar a que se cargue el dashboard/home
    cy.contains('Bienvenido').should('exist');

    // Paso 3: Hacer clic en "Control de Atrasos"
    cy.contains('div', 'Control de Atrasos').click();

    // Paso 4: Verificar que se carga la vista (AttendancePage)
    cy.contains('Registrar Atraso').should('exist'); // Ajusta si el texto es distinto

    // Paso 5: Ingresar RUT del estudiante
    cy.get('input[placeholder="Ingrese RUT"]').type('250359640');

     // Paso 6: Registrar el atraso
    cy.get('button').contains('Guardar').click();
  });
});
