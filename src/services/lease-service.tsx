import HttpService from "./common/http-service";

const apiUrl: string = "https://dapps-dev7.geveo.com:49152";

export default class LeaseService {
  constructor(private readonly httpService: HttpService) {}

  async getLeasesAsync(): Promise<any[]> {
    try {
      const response = await this.httpService.getAsync(apiUrl, "/api/leases");
      return response;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }

  async getLeaseOrdersAsync(): Promise<any[]> {
    try {
      const response = await this.httpService.getAsync(apiUrl, "/api/lease-orders");
      return response;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }

  async getLeaseOrderAsync(reference: string): Promise<any[]> {
    try {
      const response = await this.httpService.getAsync(apiUrl, `/api/lease-order/${reference}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }

  async createLeaseOrderAsync(order: any): Promise<any> {
    try {
      const response = await this.httpService.postAsync(apiUrl, "/api/create-lease-order", order);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }

  async updateLeaseOrderNftAsync(reference: string, nftId: string): Promise<any> {
    try {
      const response = await this.httpService.putAsync(apiUrl, "/api/update-lease-order-nft", { reference, nftId });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }
}
