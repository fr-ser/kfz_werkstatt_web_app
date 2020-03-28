import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { routeNames } from "common/Navigation";
import AppHeader from "common/AppHeader";
import { AppHeaderSmallScreen } from "common/MediaQueries";

import { setMatcher, clearMatchers } from "test/MediaQuery";

describe("AppHeader", () => {
  afterAll(() => {
    clearMatchers();
  });

  it("shows the page tabs and the title", () => {
    setMatcher(AppHeaderSmallScreen, false);

    const { getAllByRole, getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AppHeader />
      </MemoryRouter>
    );

    const tabTexts = getAllByRole("tab")
      .map(tab => tab.textContent)
      .sort();
    const pages = Object.values(routeNames).sort();

    expect(tabTexts).toEqual(pages);
    expect(getByText("Werkstatt-App")).toBeVisible();
  });

  it("hides the title and shows only the current page for small devices", () => {
    setMatcher(AppHeaderSmallScreen, true);

    const { getAllByRole, getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AppHeader />
      </MemoryRouter>
    );

    expect(queryByText("Werkstatt-App")).toBeFalsy;
    fireEvent.click(getByText("Navigation:", { exact: false }));

    const itemTexts = getAllByRole("menuitem")
      .map(item => item.textContent)
      .sort();
    const pages = Object.values(routeNames)
      .filter(route => route !== "übersicht") // overview is the default
      .sort();
    expect(itemTexts).toEqual(pages);
  });
});
