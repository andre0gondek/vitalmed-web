describe('Cadastro de Usuários', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 
    cy.contains('Acessar Sistema').click();
    cy.contains('Cadastrar Usuário').click();
  });

  it('Deve cadastrar um usuário Almoxarife com sucesso', () => {
    const emailUnico = `almoxarife@vitalmed.com`;

    // Preenche os dados textuais
    cy.get('input[name="nome"]').type('Jonas');
    cy.get('input[name="email"]').type(emailUnico);
    cy.get('input[name="senha"]').type('12345678');
    
    // Macete para clicar no Select do Material UI
    cy.get('[name="cargo"]').parent().click(); 
    
    // O MUI abre as opções no final do HTML da página. Buscamos pelo <li> e clicamos
    cy.get('li').contains('ALMOXARIFE').click();

    // Clica no botão de cadastrar
    cy.contains('Registrar Usuário').click();

    // Verifica se o Alert verde de sucesso apareceu contendo o nome digitado!
    cy.contains(/sucesso/i, { timeout: 10000 })
  .should('be.visible')
    ;
  });

});