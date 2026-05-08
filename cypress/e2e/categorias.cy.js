describe('Gestão de Categorias', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 
    cy.contains('Acessar Sistema').click();
    cy.contains('Categorias').click();
  });

  it('Deve cadastrar uma nova categoria com sucesso', () => {
    const nomeCategoriaUnica = `Categoria Cypress ${Date.now()}`;

    // Clica no botão de nova categoria (ajuste o texto se for diferente no seu botão)
    cy.contains('Nova Categoria').click();

    // Digita o nome da categoria. 
    // Dica: Tente usar cy.get('input[name="nomeCategoria"]') se o type abaixo falhar.
    cy.get('input[type="text"]').last().type(nomeCategoriaUnica);
    
    // Salva
    cy.contains('Salvar').click();

    // Verifica se o modal sumiu e a categoria apareceu na tabela
    cy.contains(nomeCategoriaUnica).should('be.visible');
  });

});