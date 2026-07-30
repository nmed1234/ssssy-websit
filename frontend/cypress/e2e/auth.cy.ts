// cypress/e2e/auth.cy.ts — Authentication flow E2E tests

describe("Authentication", () => {
  it("shows login page", () => {
    cy.visit("/auth/login");
    cy.contains("Login").should("be.visible");
  });

  it("redirects unauthenticated users from /admin to /auth/login", () => {
    cy.visit("/admin");
    cy.url().should("include", "/auth/login");
  });

  it("logs in with valid credentials and reaches the dashboard", () => {
    cy.loginAsAdmin();
    cy.url().should("include", "/admin");
    cy.contains("Dashboard").should("be.visible");
  });

  it("shows error on invalid credentials", () => {
    cy.visit("/auth/login");
    cy.get('[placeholder*="username"], [name="username"]').type("baduser");
    cy.get('[type="password"]').type("wrongpass");
    cy.get('[type="submit"]').click();
    cy.contains(/invalid|incorrect|error/i).should("be.visible");
  });
});
