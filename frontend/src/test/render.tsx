import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SnackbarProvider } from "notistack";

const AllTheProviders = ({ children }: any) => {
  return <SnackbarProvider>{children}</SnackbarProvider>;
};

const customRender = (ui: ReactElement<any>, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// override render method
export { customRender as render };
