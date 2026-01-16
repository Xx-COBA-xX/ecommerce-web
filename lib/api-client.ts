import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, userStorage } from './auth-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
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
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth data and redirect to login
          tokenStorage.remove();
          userStorage.remove();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  async getProvinces() {
    const response = await this.client.get('/provinces');
    return response.data;
  }

  async getEducations() {
    const response = await this.client.get('/educations');
    return response.data;
  }

  async getRoles() {
    const response = await this.client.get('/roles');
    return response.data;
  }

  async getGroups() {
    const response = await this.client.get('/groups');
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
}

export const apiClient = new ApiClient().getInstance();
