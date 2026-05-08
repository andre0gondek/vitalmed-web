describe('Registro de Movimentações', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    // Login como administrador para ter todas as permissões
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 
    cy.contains('Acessar Sistema').click();
    
    // Navega para a tela de movimentações
    cy.contains('Movimentações').click();
  });

  it('Deve registrar uma ENTRADA de estoque com sucesso', () => {
    cy.contains('Nova Movimentação').click();

    // 1. Seleciona o Insumo no Select do MUI
    // O select do MUI não tem 'name' direto no input, usamos o ID ou o label
    cy.get('#mui-component-select-idInsumo').click();
    cy.get('li[role="option"]').first().click(); 

    // 2. Seleciona o Tipo (ENTRADA) no ToggleButtonGroup
    // Como é um botão com texto, o contains funciona bem
    cy.get('button').contains('ENTRADA').click();

    // 3. Preenche Quantidade
    cy.get('input[name="quantidade"]').clear().type('50');

    // 4. Preenche ID do Usuário (Campo obrigatório no seu código para habilitar o botão)
    // Se o seu sistema não carregar o ID automaticamente do token no teste, preenchemos manual:
    cy.get('input[name="idUsuario"]').clear().type('1');

    // 5. Preenche Finalidade
    // CORREÇÃO AQUI: Usamos [name="finalidade"] sem especificar 'input', 
    // pois o Material UI transformou ele em 'textarea' devido ao multiline
    cy.get('[name="finalidade"]')
      .should('be.visible')
      .type('Entrada de teste via Cypress');
    
    // 6. Clica no botão de Salvar
    // No seu código o texto do botão muda conforme o tipo!
    cy.contains('button', 'Registrar Entrada').should('not.be.disabled').click();

    // 7. Validação final
    cy.contains('Entrada de teste via Cypress').should('be.visible');
  });

});