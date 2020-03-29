import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import * as Sentry from "@sentry/browser";
import { SnackbarProvider } from "notistack";

import App from "App";
import theme from "Theme";

if (!process.env.REACT_APP_DISABLE_SENTRY) {
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_URL, environment: process.env.NODE_ENV });
  console.log("Error reporting to Sentry is enabled");
  Sentry.captureException(Error("Testerror"));
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <App />
    </SnackbarProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
