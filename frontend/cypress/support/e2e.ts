// cypress/support/e2e.ts
// Global setup for all E2E tests

Cypress.Commands.add("loginAsAdmin", () => {
  cy.visit("/auth/login");
  cy.get('[placeholder*="username"], [name="username"]').type(Cypress.env("adminEmail") ?? "admin");
  cy.get('[type="password"]').type(Cypress.env("adminPassword") ?? "admin123");
  cy.get('[type="submit"]').click();
  cy.url().should("include", "/admin");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
    }
  }
}

export {};
