import { Routes, Route, BrowserRouter } from "react-router-dom";
import NotFound from "./pages/not-found/not-found";
import { useServiceProvider } from "./providers/service-provider";
import { useEffect, useState } from "react";
import Loader from "./components/loader-small";
import { RouteNames } from "./common/constants";
import MainLayout from "./pages/layouts/main-layout/main-layout";
import Provenance from "./pages/provenance/provenance";
import ExportOrders from "./pages/export-orders/export-orders";
import React from "react";

let initCalled = false;

function AppRoutes() {
  const [initialized, setInitialized] = useState(false);

  const { initAsync } = useServiceProvider();

  useEffect(() => {
    setInitialized(false);
  }, []);

  useEffect(() => {
    if (!initCalled) {
      initCalled = true;
      initAsync().then(() => {
        setInitialized(true);
      });
    }
  }, [initAsync]);

  return initialized ? (
    <BrowserRouter>
      <Routes>
        <Route path={RouteNames.Provenance} element={<Provenance />} />
        <Route path="/" element={<MainLayout />}>
          <Route path={RouteNames.ExportOrders} element={<ExportOrders />} />
          <Route path={RouteNames.NotFound} element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  ) : (
    <Loader />
  );
}

export default AppRoutes;
