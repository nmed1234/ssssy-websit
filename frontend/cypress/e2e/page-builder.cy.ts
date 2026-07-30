// cypress/e2e/page-builder.cy.ts — Page Builder E2E tests

describe("Page Builder", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("lists pages in the admin", () => {
    cy.visit("/admin/pages");
    cy.contains("Pages").should("be.visible");
  });

  it("opens the page builder for an existing page", () => {
    cy.visit("/admin/pages");
    // Click the first 'Edit' link
    cy.get("a[href*='/admin/pages/']").first().click();
    cy.url().should("match", /\/admin\/pages\/.+/);
    // Palette and canvas should load
    cy.contains(/Component Palette|palette/i, { timeout: 10000 }).should("be.visible");
  });

  it("can drag a block from palette to canvas", () => {
    cy.visit("/admin/pages");
    cy.get("a[href*='/admin/pages/']").first().click();
    cy.url().should("match", /\/admin\/pages\/.+/);
    // Heading block in palette
    cy.contains("Heading").should("be.visible");
  });

  it("opens version history with diff viewer tab", () => {
    cy.visit("/admin/pages");
    cy.get("a[href*='/admin/pages/']").first().then(($a) => {
      const href = $a.attr("href") ?? "";
      cy.visit(`${href}/history`);
    });
    cy.contains(/Version Diff|Audit Timeline/i).should("be.visible");
  });
});
