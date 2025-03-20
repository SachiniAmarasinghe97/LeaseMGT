import "./main-layout.scss";
import { Route, Routes } from "react-router-dom";
import { Claims, RouteNames } from "../../../common/constants";
import ExportOrders from "../../export-orders/export-orders";
import Home from "../../home/home";
import React from "react";

export default function MainLayout() {
  return (
    <div className="layout-container">
      <div className="layout-content">
      <Routes>
          <Route path={RouteNames.Base} element={<Home />} />
      </Routes>
      </div>
    </div>
  );
}
