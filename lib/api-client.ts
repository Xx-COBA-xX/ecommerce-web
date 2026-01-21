import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage, userStorage } from "./auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.get();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth data and redirect to login
          tokenStorage.remove();
          userStorage.remove();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  // Proxy default axios methods
  get<T = any, R = any, D = any>(url: string, config?: any): Promise<R> {
    return this.client.get(url, config);
  }

  post<T = any, R = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<R> {
    return this.client.post(url, data, config);
  }

  put<T = any, R = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<R> {
    return this.client.put(url, data, config);
  }

  patch<T = any, R = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<R> {
    return this.client.patch(url, data, config);
  }

  delete<T = any, R = any, D = any>(url: string, config?: any): Promise<R> {
    return this.client.delete(url, config);
  }

  async getProvinces() {
    const response = await this.client.get("/provinces");
    return response.data;
  }

  async getEducations() {
    const response = await this.client.get("/educations");
    return response.data;
  }

  async getRoles() {
    const response = await this.client.get("/roles");
    return response.data;
  }

  async getGroups(params?: any) {
    const response = await this.client.get("/groups", { params });
    return response.data;
  }

  async getGroup(id: string) {
    const response = await this.client.get(`/groups/${id}`);
    return response.data;
  }

  async createGroup(data: any) {
    const response = await this.client.post("/groups", data);
    return response.data;
  }

  async uploadGroupLogo(groupId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.client.post(
      `/groups/${groupId}/upload-logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  async updateGroup(id: string, data: any) {
    const response = await this.client.patch(`/groups/${id}`, data);
    return response.data;
  }

  async deleteGroup(id: string) {
    const response = await this.client.delete(`/groups/${id}`);
    return response.data;
  }

  async changeGroupLeader(groupId: string, newLeaderId: string) {
    const response = await this.client.patch(
      `/groups/${groupId}/change-leader`,
      {
        new_leader_id: newLeaderId,
      },
    );
    return response.data;
  }

  async getGroupMembers(id: string, params: any) {
    const response = await this.client.get(`/groups/${id}/members`, { params });
    return response.data;
  }
  async getMembers(params?: any) {
    const response = await this.client.get("/members", { params });
    return response.data;
  }

  async getMember(id: string) {
    const response = await this.client.get(`/members/${id}`);
    return response.data;
  }

  async deleteMember(id: string) {
    const response = await this.client.delete(`/members/${id}`);
    return response.data;
  }

  // Sector methods
  async getSectors(params?: any) {
    const response = await this.client.get("/sectors", { params });
    return response.data;
  }

  async getSector(id: string) {
    const response = await this.client.get(`/sectors/${id}`);
    return response.data;
  }

  async getSectorGroups(id: string, params: any) {
    const response = await this.client.get(`/sectors/${id}/groups`, { params });
    return response.data;
  }

  async createSector(data: any) {
    const response = await this.client.post("/sectors", data);
    return response.data;
  }

  async updateSector(id: string, data: any) {
    const response = await this.client.patch(`/sectors/${id}`, data);
    return response.data;
  }

  async deleteSector(id: string) {
    const response = await this.client.delete(`/sectors/${id}`);
    return response.data;
  }

  async changeSectorLeader(sectorId: string, newLeaderId: string) {
    const response = await this.client.patch(
      `/sectors/${sectorId}/change-leader`,
      {
        new_leader_id: newLeaderId,
      },
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
