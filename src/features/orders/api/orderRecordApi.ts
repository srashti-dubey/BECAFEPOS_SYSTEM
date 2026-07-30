import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { OrderRecord } from '@/database/appDatabase'

class OrderRecordApi extends BaseService {
  saveOrderRecord(order: OrderRecord) {
    return this.post<OrderRecord>(API_ENDPOINTS.posOrders, order)
  }
}

export const orderRecordApi = new OrderRecordApi()
