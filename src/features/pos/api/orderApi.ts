import { BaseService } from "@/services/baseService";
import { mockSaveOrder } from "@/mocks/posMockApi";
import type { Order } from "@/database/appDatabase";

class OrderApi extends BaseService {
  // Bypasses the real API — the real backend has no /orders endpoint at all (not in its OpenAPI
  // spec; confirmed 2026-07-30). Once that endpoint exists, replace this with
  // `return this.post<Order>(API_ENDPOINTS.posOrders, order)`.
  saveOrder(order: Order) {
    return mockSaveOrder(order);
  }
}

export const orderApi = new OrderApi();
