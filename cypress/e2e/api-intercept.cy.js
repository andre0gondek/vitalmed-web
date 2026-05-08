describe('Validação do Payload (Envio de Dados para a API)', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('#email').type('admin@vitalmed.com'); 
    cy.get('#senha').type('admin123'); 
    cy.contains('Acessar Sistema').click();
    cy.contains('Gestão de Insumos').click();
  });

  it('Deve enviar o JSON no formato EXATO exigido pelo DTO do Spring Boot', () => {
    
    // 1. Diz para o Cypress "espionar" qualquer requisição POST para a rota /insumos
    cy.intercept('POST', '**/insumos').as('requisicaoCriarInsumo');

    // 2. Preenche o formulário normalmente
    cy.contains('Novo Insumo').click();
    cy.get('input[name="nomeInsumo"]').type('Luva Cirúrgica Especial');
    
    // Seleciona Categoria
    cy.get('#mui-component-select-idCategoria').click();
    cy.get('li[role="option"]').first().click();
    
    // Seleciona outros campos
    cy.get('input[name="material"]').type('Látex');
    cy.get('input[name="estoqueAtual"]').type('200');
    cy.get('input[name="estoqueMinimo"]').type('50');
    
    // 3. Clica em salvar
    cy.contains('Salvar Insumo').click();

    // 4. A MAGIA ACONTECE AQUI: O Cypress captura a requisição antes de ir pro Java
    cy.wait('@requisicaoCriarInsumo').then((interception) => {
      
      // Pega o JSON que o React tentou enviar
      const payload = interception.request.body;

      // Fazemos asserções para garantir que o programador não errou o nome das variáveis
      expect(payload).to.have.property('nomeInsumo', 'Luva Cirúrgica Especial');
      expect(payload).to.have.property('material', 'Látex');
      
      // Garante que os números foram enviados como números (e não como strings, o que quebraria o Java)
      // Como o TextField do React envia string por padrão, no intercept você pode testar se a conversão ocorreu
      // Convertemos ambos para Number() antes de comparar
      expect(Number(payload.estoqueAtual)).to.equal(200); 
      expect(Number(payload.estoqueMinimo)).to.equal(50);

      // Garante que o idCategoria existe e não está vazio
      expect(Number(payload.idCategoria)).to.be.greaterThan(0);
    });
  });

});