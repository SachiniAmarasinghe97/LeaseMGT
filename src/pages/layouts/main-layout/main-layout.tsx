import "./main-layout.scss";
import { Route, Routes } from "react-router-dom";
import { RouteNames } from "../../../common/constants";
import LeaseOrders from "../../lease-orders/lease-orders";

export default function MainLayout() {
  return (
    <div className="layout-container">
      <div className="layout-content">
        <Routes>
          <Route path={RouteNames.LeaseOrders} element={<LeaseOrders />} />
        </Routes>
      </div>
    </div>
  );
}
