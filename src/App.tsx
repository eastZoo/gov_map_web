import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { NavermapsProvider } from "react-naver-maps";
import HomePage from "./pages/home/HomePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("version 1.0.0");
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <NavermapsProvider ncpClientId="qm9fz9el2q">
          <HomePage />
        </NavermapsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
