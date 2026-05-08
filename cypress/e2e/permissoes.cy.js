describe('Controle de Acesso (RBAC)', () => {
  
  it('Almoxarife não deve ver o botão de Novo Insumo', () => {
    cy.visit('http://localhost:5173');
    
    // Faça login com a conta do Almoxarife
    cy.get('#email').type('almoxarife@vitalmed.com'); 
    cy.get('#senha').type('12345678'); 
    cy.contains('Acessar Sistema').click();

    // Vai para a tela de insumos
    cy.contains('Gestão de Insumos').click();

    // Garante que a tela carregou
    cy.contains('Estoque de Insumos').should('be.visible');

    // Verifica que o botão "Novo Insumo" NÃO existe na tela
    cy.contains('Novo Insumo').should('not.exist');
  });

});