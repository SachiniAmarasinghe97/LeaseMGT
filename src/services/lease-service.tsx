import HttpService from "./common/http-service";

const apiUrl: string = process.env.REACT_APP_API_URL || "";

export default class LeaseService {
  constructor(private readonly httpService: HttpService) {}

  async getLeasesAsync(): Promise<any[]> {
    const response = await this.httpService.getAsync(apiUrl, "leases");
    return response;
  }

  async getLeaseOrdersAsync(): Promise<any[]> {
    const response = await this.httpService.getAsync(apiUrl, "lease-orders");
    return response;
  }

  async getLeaseOrderAsync(reference: string): Promise<any> {
    const response = await this.httpService.getAsync(apiUrl, `lease-order/${reference}`);
    return response;
  }

  async deleteLeaseOrderAsync(reference: string): Promise<any> {
    const response = await this.httpService.deleteAsync(apiUrl, `lease-order/${reference}`);
    return response.leaseOrder;
  }

  async createLeaseOrderAsync(order: any): Promise<any> {
    const response = await this.httpService.postAsync(apiUrl, "create-lease-order", order);
    return response.leaseOrder;
  }

  async updateLeaseOrderNftAsync(reference: string, nftId: string): Promise<any> {
    const response = await this.httpService.putAsync(apiUrl, "update-lease-order-nft", { reference, nftId });
    return response.leaseOrder;
  }
}
