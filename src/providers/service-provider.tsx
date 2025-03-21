import { createContext, ReactNode, useContext } from "react";
import LeaseService from "../services/lease-service";
import HttpService from "../services/common/http-service";
import XrplService from "../services/integrations/xrpl-service";

const walletSecret: string = process.env.REACT_APP_XRP_WALLET_SECRET || "";
const server: string = process.env.REACT_APP_XRP_SERVER || "";

class Dependencies {
  appName!: string;
  leaseService: LeaseService;
  xrplService: XrplService;
}

const ServiceContext = createContext(new Dependencies());

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const appName = process.env.REACT_APP_NAME ?? "";
  const httpService = new HttpService();
  const leaseService = new LeaseService(httpService);
  const xrplService = new XrplService(server, walletSecret);

  return (
    <ServiceContext.Provider
      value={{
        appName,
        leaseService,
        xrplService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServiceProvider = () => {
  return useContext(ServiceContext);
};
