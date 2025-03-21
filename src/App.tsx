import "./App.scss";
import { ServiceProvider } from "./providers/service-provider";
import AppRoutes from "./AppRoutes";
import { ThemeProvider } from "./providers/theme-provider";

function App() {
  return (
    <>
      <ServiceProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </ServiceProvider>
    </>
  );
}

export default App;
