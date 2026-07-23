import { BaseService } from "@/services/baseService";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Order } from "@/database/appDatabase";

class OrderApi extends BaseService {
  saveOrder(order: Order) {
    return this.post<Order>(API_ENDPOINTS.posOrders, order);
  }
}

export const orderApi = new OrderApi();
