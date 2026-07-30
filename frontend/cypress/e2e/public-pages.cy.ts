// cypress/e2e/public-pages.cy.ts — Public website E2E tests

describe("Public Pages", () => {
  it("loads the homepage", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
  });

  it("shows the navigation menu", () => {
    cy.visit("/");
    cy.get("nav, header").should("be.visible");
  });

  it("loads the events page", () => {
    cy.visit("/events");
    cy.contains(/Events?/i).should("be.visible");
  });

  it("loads the news page", () => {
    cy.visit("/news");
    cy.contains(/News|Articles/i).should("be.visible");
  });

  it("loads the publications page", () => {
    cy.visit("/publications");
    cy.contains(/Publications?/i).should("be.visible");
  });

  it("loads the members directory", () => {
    cy.visit("/members");
    cy.contains(/Members?/i).should("be.visible");
  });

  it("loads the jobs page", () => {
    cy.visit("/jobs");
    cy.contains(/Jobs?|Vacancies/i).should("be.visible");
  });

  it("loads the search page", () => {
    cy.visit("/search?q=soil");
    cy.contains(/Search/i).should("be.visible");
  });
});
