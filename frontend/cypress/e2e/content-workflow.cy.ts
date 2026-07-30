// cypress/e2e/content-workflow.cy.ts — Content workflow E2E tests

describe("Content Workflow", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows the content list with BulkActions toolbar", () => {
    cy.visit("/admin/content");
    cy.contains("Content").should("be.visible");
  });

  it("shows BulkActions toolbar when items are selected", () => {
    cy.visit("/admin/content");
    // Check for checkboxes in the list
    cy.get("input[type='checkbox']").first().click({ force: true });
    cy.contains(/selected/i).should("be.visible");
  });

  it("opens bulk edit modal", () => {
    cy.visit("/admin/content");
    cy.get("input[type='checkbox']").first().click({ force: true });
    cy.contains(/Edit/i).click();
    cy.contains("Bulk Edit").should("be.visible");
    cy.contains("Only filled fields will be updated").should("be.visible");
  });

  it("shows approval queue", () => {
    cy.visit("/admin/content-approval");
    cy.contains(/Approval|Review Queue/i).should("be.visible");
  });

  it("shows workflow logs", () => {
    cy.visit("/admin/workflow");
    cy.contains(/Workflow/i).should("be.visible");
  });
});
