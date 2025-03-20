import axios from "axios";

export default class PolicyService {
  async getPoliciesAsync(): Promise<any[]> {
    try {
      const response = await axios.get("/api/policies");
      return response.data as any[];
    } catch (error) {
      console.error("Failed to fetch policies", error);
      return [];
    }
  }

  async createPolicyAsync(policy: any): Promise<any | null> {
    try {
      const response = await axios.post("/api/policies", policy);
      return response.data;
    } catch (error) {
      console.error("Failed to create policy", error);
      return null;
    }
  }

  async viewPolicyAsync(id: number): Promise<any | null> {
    try {
      const response = await axios.get(`/api/policies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch policy details", error);
      return null;
    }
  }

  async updatePolicyNftAsync(id: number, nFTokenId: string): Promise<boolean> {
    try {
      const response = await axios.put(`/api/policies/${id}/nft`, { nFTokenId });
      return response.status === 200;
    } catch (error) {
      console.error("Failed to update policy NFT", error);
      return false;
    }
  }
}
