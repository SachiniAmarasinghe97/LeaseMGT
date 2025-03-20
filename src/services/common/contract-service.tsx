import { StorageKeys, ContractResponseTypes, EventNames } from "../../common/constants";
import { ContractRequestType } from "../../common/enums";
import DataMappingHelper from "../../helpers/data-mapping-helper";
import { Auth } from "../../models/auth";
import { ContractRequest, ContractResponse } from "../../models/contract";
import ToastMessage from "../../utils/toast-message";
import StorageService from "./storage-service";
import EventEmitter from "../../utils/event-emiter";

const HotPocket = (window as any).HotPocket;

export default class ContractService {
  userKeyPair = null;
  client: any = null;
  isConnectionSucceeded = false;
  servers: string[];
  eventEmitter: EventEmitter;

  isInitCalled = false;

  promiseMap = new Map();

  constructor(servers: string[], private readonly storageService: StorageService, eventEmitter: EventEmitter) {
    this.servers = servers;
    this.eventEmitter = eventEmitter;
  }

  private handleUnauthorizedError() {
    ToastMessage.show("Unauthorized access. Please login again.");
    this.storageService.removeAll();
    window.location.reload();
  }

  async initAsync(): Promise<boolean> {
    if (!this.userKeyPair) {
      try {
        this.userKeyPair = await HotPocket.generateKeys();
      } catch (error) {
        console.log(error);
      }
    }

    if (!this.client && this.userKeyPair) {
      this.client = await HotPocket.createClient(this.servers, this.userKeyPair);
    }
    console.log("Initialized");
    if (this.client) {
      // This will get fired if HP server disconnects unexpectedly.
      this.client.on(HotPocket.events.disconnect, () => {
        console.log("Disconnected");
        this.isConnectionSucceeded = false;
        ToastMessage.show("Connection failed. Please check your internet connection or try again later.");
        // window.location.reload();
      });

      // This will get fired as servers connects/disconnects.
      this.client.on(HotPocket.events.connectionChange, (server: any, action: any) => {
        console.log(server + " " + action);

        if (action === "add") {
          this.isConnectionSucceeded = true;
        } else if (action === "remove") {
          this.isConnectionSucceeded = false;
        }
        this.eventEmitter.emit(EventNames.Common.ContractConnectionChanged);
      });

      // This will get fired when contract sends outputs.
      this.client.on(HotPocket.events.contractOutput, (r: any) => {
        r.outputs.forEach((o: any) => {
          const pId = o.promiseId;
          if (o.error) {
            if (o.error?.code === ContractResponseTypes.UNAUTHORIZED) {
              this.promiseMap.delete(pId);
              this.handleUnauthorizedError();
            } else {
              this.promiseMap.get(pId)?.rejecter(o.error);
            }
          } else {
            this.promiseMap.get(pId)?.resolver(o.success);
          }

          this.promiseMap.delete(pId);
        });
      });

      this.client.on(HotPocket.events.healthEvent, (ev: any) => {
        console.log(ev);
      });

      if (!this.isConnectionSucceeded) {
        if (!(await this.client.connect())) {
          console.log("Connection failed.");
          ToastMessage.show("Connection failed. Please check your internet connection or try again later.");
          return false;
        }
        console.log("HotPocket Connected.");
        this.isConnectionSucceeded = true;
      }

      this.isInitCalled = true;

      return true;
    } else {
      return false;
    }
  }

  async send<S, R>(request: ContractRequest<S>, type: ContractRequestType = ContractRequestType.ReadRequest): Promise<ContractResponse<R> | null> {
    let auth = this.storageService.getItem<Auth>(StorageKeys.Auth);
    request.tenantId = auth?.selectedTenantId ?? 0;
    request.token = auth?.contractToken ?? "";
    let res: ContractResponse<any> | null = null;
    // let req: any = {};
    // Object.entries(request).forEach(([key, value]) => {
    // req[key === "data" ? key : `${key.charAt(0).toLocaleLowerCase()}${key.slice(1)}`] = value;
    // });
    if (type === ContractRequestType.ReadRequest) {
      res = await this.submitReadRequest(request);
    } else {
      res = await this.submitInputToContract(request);
    }
    return res
      ? {
          code: res.code ?? 0,
          message: res.message,
          data: DataMappingHelper.convertToDto<R>(res.data),
        }
      : null;
  }

  private submitInputToContract(inp: any): Promise<any> {
    const promiseId = this.getUniqueId();
    const inpString = JSON.stringify({ promiseId: promiseId, ...inp });

    return new Promise((resolve, reject) => {
      this.promiseMap.set(promiseId, {
        resolver: resolve,
        rejecter: reject,
      });

      this.client.submitContractInput(inpString).then((input: any) => {
        input?.submissionStatus.then((s: any) => {
          console.log("submitContractInput - s :" + JSON.stringify(s));
          if (s.status === "accepted") {
            console.log("Ledger_Accepted");
            return s;
          } else if (s.status !== "accepted") {
            console.log(`Ledger_Rejection: ${s.reason}`);
            this.promiseMap.get(promiseId)?.rejecter(new Error(`Ledger_Rejection: ${s.reason}`));
            this.promiseMap.delete(promiseId);
          }
        });
      });
    });
  }

  private getUniqueId(): string {
    const typedArray = new Uint8Array(10);
    const randomValues = window.crypto.getRandomValues(typedArray);
    return randomValues.join("");
  }

  private async submitReadRequest(inp: any): Promise<any> {
    const inpString = JSON.stringify(inp);

    const output = await this.client.submitContractReadRequest(inpString);
    if (output?.error) {
      if (output.error?.code === ContractResponseTypes.UNAUTHORIZED) {
        this.handleUnauthorizedError();
      } else {
        throw output.error;
      }
    } else {
      return output != null ? output?.success : null;
    }
  }
}
