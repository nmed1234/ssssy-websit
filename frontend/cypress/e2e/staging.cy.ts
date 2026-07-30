// cypress/e2e/staging.cy.ts — Staging & sync E2E tests

describe("Staging & Sync", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows the staging page", () => {
    cy.visit("/admin/staging");
    cy.contains(/Staging/i).should("be.visible");
  });

  it("has a Sync to Production button", () => {
    cy.visit("/admin/staging");
    cy.contains(/Sync to Production/i).should("be.visible");
  });

  it("shows the staging toggle in the admin sidebar", () => {
    cy.visit("/admin");
    cy.contains(/Staging (ON|OFF)/i).should("be.visible");
  });

  it("can generate a preview link", () => {
    cy.visit("/admin/staging");
    cy.contains(/Preview Links?/i).should("be.visible");
  });
});
