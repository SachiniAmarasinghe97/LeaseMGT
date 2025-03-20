import "./App.scss";
import { ServiceProvider } from "./providers/service-provider";
import AppRoutes from "./AppRoutes";
import { ThemeProvider } from "./providers/theme-provider";
import { ToastContainer } from "react-toastify";
import React from "react";
import Home from "./pages/home/home"; // Import the Home component

function App() {
  return (
    <>
      <ServiceProvider>
        <ThemeProvider>
          <Home /> {/* Render the Home component */}
        </ThemeProvider>
      </ServiceProvider>
      <ToastContainer />
    </>
  );
}

export default App;