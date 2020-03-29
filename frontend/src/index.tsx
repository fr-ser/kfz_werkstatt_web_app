import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import * as Sentry from "@sentry/browser";

import App from "App";
import theme from "Theme";

if (!process.env.REACT_APP_DISABLE_SENTRY) {
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_URL, environment: process.env.NODE_ENV });
  console.log("Error reporting to Sentry is enabled");
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
