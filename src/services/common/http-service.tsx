import axios from "axios";

export default class HttpService {
  async postAsync(apiUrl: string, method: string, data: any = {}, config: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .post(`${apiUrl}/${method}`, data, config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  async putAsync(apiUrl: string, method: string, data: any = {}, config: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .put(`${apiUrl}/${method}`, data, config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getAsync(apiUrl: string, method: string, params: any = {}, config: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}/${method}`, {
          params,
          ...config,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async deleteAsync(apiUrl: string, method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .delete(`${apiUrl}/${method}`, params)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
