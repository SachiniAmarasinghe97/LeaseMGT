import "./App.scss";
import { ServiceProvider } from "./providers/service-provider";
import AppRoutes from "./AppRoutes";
import { ThemeProvider } from "./providers/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ServiceProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </ServiceProvider>
      <ToastContainer />
    </>
  );
}

export default App;
