describe('Inicio de sesión y registro de un nuevo usuario', () => {
  it('Usuario 123 navega a "Registrar Usuario" y crea uno nuevo', () => {
    cy.visit('http://localhost:3001/login');

    // Paso 1: Login
    cy.get('input[placeholder="Ej: 12.345.678-9"]').type('123');
    cy.get('input[placeholder="Ingresa tu contraseña"]').type('12345678');
    cy.get('button').contains('Iniciar Sesión').click();

    // Paso 2: Esperar carga del dashboard
    cy.contains('Bienvenido').should('exist');

    // Paso 3: Clic en el menú "Registrar Usuario"
    cy.contains('div', 'Registrar Usuario').click();

    // Paso 4: Completar formulario
    cy.get('input').eq(0).type('Juan Test');             // Nombre de usuario
    cy.get('input').eq(1).type('123456789');             // RUT
    cy.get('input').eq(2).type('2');                     // Código de Rol
    cy.get('input').eq(3).type('testpassword');          // Contraseña
    cy.get('input').eq(4).type('testpassword');          // Confirmar contraseña

    // Paso 5: Enviar formulario
    cy.get('button').contains('Registrar').click();

    // Paso 6: Verificar mensaje de éxito (ajusta si es diferente)
    cy.contains('Usuario registrado correctamente').should('exist');
  });
});
