const addToCartButtonSelector =
  '.cx-config-textfield-add-to-cart-btn div button';

export function clickOnConfigureButton() {
  cy.get('cx-configure-product a').click({ force: true });
}

export function clickOnEditConfigurationButton() {
  cy.get('cx-configure-cart-entry button')
    .contains('Edit')
    .click()
    .then(() => {
      this.verifyConfigurationPageIsDisplayed();
    });
}

export function verifyConfigurationPageIsDisplayed() {
  cy.get('cx-config-textfield-form').should('be.visible');
}

export function verifyAttributeIsDisplayed(attributeName: string) {
  cy.wait(2000);
  const attributeId = getAttributeId(attributeName);
  cy.get(`#${attributeId}`).should('be.visible');
}

export function getAttributeId(attributeName: string) {
  const trimmedName = attributeName.replace(/\s/g, '');
  return `cx-config-textfield${trimmedName}`;
}

export function selectAttribute(attributeName: string, value?: string) {
  const attributeId = getAttributeId(attributeName);
  const selector = '#' + attributeId + ' div div div input';
  cy.get(selector).clear().type(value);
}

export function clickAddToCartButton() {
  cy.get(addToCartButtonSelector).click({
    force: true,
  });

  cy.wait(1500);
}

export function clickOnAddToCartButtonOnProductDetails() {
  cy.get('cx-add-to-cart button.btn-primary').contains('Add to cart').click();
}

export function clickOnViewCartButtonOnProductDetails() {
  cy.get('div.cx-dialog-buttons a.btn-primary').contains('view cart').click();
}

export function verifyTextfieldProductInCart(productName: string) {
  cy.get('cx-cart-item-list').contains(productName).should('be.visible');
}
