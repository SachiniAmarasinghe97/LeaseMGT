import React, { createContext, ReactNode, useContext } from "react";
import LeaseService from "../services/lease-service";
import HttpService from "../services/common/http-service";

class Dependencies {
  appName!: string;
  initAsync!: () => Promise<void>;
  leaseService: LeaseService;
}

const ServiceContext = createContext(new Dependencies());

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const appName = process.env.REACT_APP_NAME ?? "";
  const httpService = new HttpService();
  const leaseService = new LeaseService(httpService);

  const initAsync = async () => {};

  return (
    <ServiceContext.Provider
      value={{
        appName,
        initAsync,
        leaseService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServiceProvider = () => {
  return useContext(ServiceContext);
};
