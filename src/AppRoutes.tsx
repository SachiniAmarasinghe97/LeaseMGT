import { Routes, Route, BrowserRouter } from "react-router-dom";
import NotFound from "./pages/not-found/not-found";
import { RouteNames } from "./common/constants";
import MainLayout from "./pages/layouts/main-layout/main-layout";
import LeaseOrders from "./pages/lease-orders/lease-orders";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path={RouteNames.LeaseOrders} element={<LeaseOrders />} />
          <Route path={RouteNames.NotFound} element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
