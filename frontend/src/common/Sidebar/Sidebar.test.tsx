import React, { useEffect } from "react";
import { fireEvent, render, waitForElement } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "App";
import { SidebarBigScreen } from "common/MediaQueries";
import Sidebar, { useSidebar, SidebarProvider } from "common/Sidebar";

import { setMatcher, clearMatchers } from "test/MediaQuery";

describe("Sidebar", () => {
  afterAll(() => {
    clearMatchers();
  });

  it("loads action buttons", async () => {
    const mockFn = jest.fn();
    setMatcher(SidebarBigScreen, true);

    function DummyComponent() {
      const { setMainActions } = useSidebar();

      useEffect(() => {
        setMainActions([<button onClick={mockFn} key="1" role="some-button"></button>]);
      }, []);

      return <div>Test</div>;
    }

    const { findByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <SidebarProvider>
          <Sidebar />
          <DummyComponent />
        </SidebarProvider>
      </MemoryRouter>
    );

    fireEvent.click(await findByRole("some-button"));

    expect(mockFn).toHaveBeenCalled();
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
