import { red } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#607d8b",
    },
    secondary: {
      main: "#FFF",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fafafa",
    },
  },
});

export default theme;
