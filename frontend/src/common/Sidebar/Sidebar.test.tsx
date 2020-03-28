import React from "react";
import { fireEvent, render, waitForElement, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "App";
import { SidebarBigScreen } from "common/MediaQueries";

import { setMatcher, clearMatchers } from "test/MediaQuery";

describe("Sidebar", () => {
  afterAll(() => {
    clearMatchers();
  });

  it("has a permanent (visible) sidebar for big screens", () => {
    setMatcher(SidebarBigScreen, true);

    const { queryByRole, getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(getByRole("sidebar")).toBeVisible();
    expect(queryByRole("sidebar-toggle")).toBeFalsy();
  });

  describe("small screens", () => {
    beforeEach(() => {
      setMatcher(SidebarBigScreen, false);
    });

    it("has a temporary (not visible by default) sidebar for small screens", () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      );

      expect(getByRole("sidebar", { hidden: true })).not.toBeVisible();
      expect(getByRole("sidebar-toggle")).toBeVisible();
    });

    it("toggles the Sidebar open", async () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      );

      expect(getByRole("sidebar", { hidden: true })).not.toBeVisible();
      fireEvent.click(getByRole("sidebar-toggle"));

      await waitForElement(() => {
        return getByRole("sidebar");
      });
    });
  });
});
