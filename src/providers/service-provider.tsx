import React, { createContext, ReactNode, useContext } from "react";
import StorageService from "../services/common/storage-service";
import EventEmitter from "eventemitter3";
// import ProvenanceService from "../services/common/provenance-service";
// import ExportOrderService from "../services/export-order-service";
import LeaseService from "../services/lease-service";
import PolicyService from "../services/policy-service";

class Dependencies {
  appName!: string;
  initAsync!: () => Promise<void>;
  eventEmitter: EventEmitter;
  storageService: StorageService;
  // provenanceService!: ProvenanceService;
  // exportOrderService!: ExportOrderService;
  leaseService: LeaseService;
  policyService: PolicyService;
}

const ServiceContext = createContext(new Dependencies());

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const appName = process.env.REACT_APP_NAME ?? "";
  const eventEmitter = new EventEmitter();
  const storageService = new StorageService();
  // const provenanceService = new ProvenanceService(contractService);
  // const exportOrderService = new ExportOrderService(contractService);

  const initAsync = async () => {
  };

  return (
    <ServiceContext.Provider
      value={{
        appName,
        initAsync,
        eventEmitter,
        storageService,
        leaseService: new LeaseService(),
        policyService: new PolicyService(),
        // provenanceService,
        // exportOrderService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServiceProvider = () => {
  return useContext(ServiceContext);
};
