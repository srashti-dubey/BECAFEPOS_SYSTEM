import { BaseService } from "@/services/baseService";
import type { Product } from "@/database/appDatabase";

class ProductApi extends BaseService {
  // Bypasses the real API and reads the static dummy catalog directly — the real backend has no
  // /products endpoint at all (not in its OpenAPI spec; confirmed 2026-07-30). Once that endpoint
  // exists, replace this with `return await this.get<Product[]>(API_ENDPOINTS.posProducts)`.
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${import.meta.env.BASE_URL}products.json`);
    if (!response.ok) throw new Error("Failed to load static products");
    return response.json();
  }
}

export const productApi = new ProductApi();
