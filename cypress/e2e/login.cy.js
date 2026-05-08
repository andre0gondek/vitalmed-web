describe('Fluxo de Login VitalMed', () => {
  
    it('Deve fazer login com credenciais válidas e carregar o Dashboard', () => {
    // 1. Acessa a página inicial (ajuste a porta se o seu Vite não estiver usando a 5173)
    cy.visit('http://localhost:5173');

    // 2. Verifica se o título do sistema está na tela
    cy.contains('VitalMed').should('be.visible');

    // 3. Preenche o formulário de login usando os IDs dos TextFields
    // Substitua pelo e-mail e senha de um ADMINISTRADOR que realmente exista no seu banco!
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 

    // 4. Clica no botão de enviar
    cy.contains('Acessar Sistema').click();

    // 5. Verifica se fomos redirecionados para a URL correta
    cy.url().should('include', '/dashboard');

    // 6. Verifica se o painel de KPIs carregou (sinal de que a API respondeu bem!)
    cy.contains('Painel Geral VitalMed').should('be.visible');
    cy.contains('Insumos Cadastrados').should('be.visible');
  });

  // NOVO TESTE NO MESMO ARQUIVO:
  it('Deve mostrar mensagem de erro ao errar a senha', () => {
    cy.visit('http://localhost:5173');
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('senha-errada-123'); 
    cy.contains('Acessar Sistema').click();

    // Verifica se o Alert vermelho do MUI apareceu na tela
    cy.get('.MuiAlert-root').should('contain', 'E-mail ou senha incorretos');
  });

});