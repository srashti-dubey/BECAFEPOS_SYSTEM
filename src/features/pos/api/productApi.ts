import { BaseService } from "@/services/baseService";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Product } from "@/database/appDatabase";

class ProductApi extends BaseService {
  async getProducts(): Promise<Product[]> {
    try {
      return await this.get<Product[]>(API_ENDPOINTS.posProducts);
    } catch {
      const response = await fetch(`${import.meta.env.BASE_URL}products.json`);
      if (!response.ok) throw new Error("Failed to load static products");
      return response.json();
    }
  }
}

export const productApi = new ProductApi();
