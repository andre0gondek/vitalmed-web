describe('Gestão de Insumos', () => {
  
  // O beforeEach roda ANTES de cada teste. Perfeito para fazer o login sem repetir código!
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 
    cy.contains('Acessar Sistema').click();
    cy.contains('Gestão de Insumos').click();
  });

  it('Deve cadastrar um novo insumo com sucesso', () => {
    // Clica no botão de abrir o modal
    cy.contains('Novo Insumo').click();

    // O Cypress digita nos inputs pelo "name" que você colocou no TextField do MUI
    cy.get('input[name="nomeInsumo"]').type('Seringa 10ml Teste Cypress');
    
    // Abre o select de categoria e clica na primeira opção
    cy.get('#mui-component-select-idCategoria').click();
    cy.get('li[role="option"]').first().click();

    cy.get('input[name="estoqueAtual"]').type('100');
    cy.get('input[name="estoqueMinimo"]').type('20');
    
    // Salva o formulário
    cy.contains('Salvar Insumo').click();

    // Verifica se o modal fechou e se o item apareceu na tabela!
    cy.contains('Seringa 10ml Teste Cypress').should('be.visible');
  });

});