import { createTheme } from "@mui/material"

const theme = createTheme({
  palette: {
    primary: {
      light: "#10b981",
      main: "#059669",
      dark: "#047857",
    },
  },
  typography: {
    "fontFamily": "var(--font-inter)",
  },
})

export default theme
