/// <reference types="cypress" />

before(() => {
  cy.disconnectMetamaskWalletFromAllDapps()
})

describe("delete-guild", () => {
  before(() => {
    cy.visit("/cypress-testing-gang")
  })

  describe("without wallet", () => {
    it("renders page", () => {
      cy.get("h1").should("contain.text", "Cypress Testing Gang")
    })

    it("edit button is not visible", () => {
      cy.get(
        ".chakra-container .chakra-stack .chakra-button.chakra-menu__menu-button"
      ).should("not.exist")
    })
  })

  describe("with wallet", () => {
    before(() => {
      cy.connectWallet()
    })

    it("edit button is visible", () => {
      cy.get(
        ".chakra-container .chakra-stack .chakra-button.chakra-menu__menu-button"
      )
        .should("exist")
        .should("be.visible")
    })

    it("open edit tab", () => {
      cy.get(
        ".chakra-container .chakra-stack .chakra-button.chakra-menu__menu-button"
      ).click()
      cy.findByText("Edit guild").parent().click()
      cy.get(".chakra-slide h2").should("contain.text", "Edit guild")
    })

    it("can delete guild", () => {
      cy.get(".chakra-slide .chakra-button").first().click()
      cy.findByText("Delete").click()
      cy.confirmMetamaskSignatureRequest()
      cy.url().should("not.match", /[0-9a-z\-]+$/i)
    })
  })
})
