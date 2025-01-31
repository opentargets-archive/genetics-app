import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, createTheme, ThemeOptions } from "@material-ui/core/styles";
import { ReactNode } from "react";

import defaultTheme from "./defaultTheme";

function ThemeProvider({ children, theme = defaultTheme }: {children : ReactNode, theme: ThemeOptions }) {
  const uiKitTheme = createTheme(theme);
  return (
    <MuiThemeProvider theme={uiKitTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
