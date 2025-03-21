import { Routes, Route, BrowserRouter } from "react-router-dom";
import NotFound from "./pages/not-found/not-found";
import { RouteNames } from "./common/constants";
import MainLayout from "./pages/layouts/main-layout/main-layout";
import LeaseOrder from "./pages/lease-order/lease-order";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path={RouteNames.NotFound} element={<NotFound />} />
        </Route>
        <Route path={RouteNames.LeaseOrder} element={<LeaseOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
