import axios from "axios";

export default class LeaseService {
  async getLeasesAsync(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>("/api/leases");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch leases", error);
      return [];
    }
  }
}
