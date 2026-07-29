import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { InventoryGlobal } from '@/database/appDatabase'

class InventoryApi extends BaseService {
  saveInventory(item: InventoryGlobal) {
    return this.post<InventoryGlobal>(API_ENDPOINTS.inventory, item)
  }
}

export const inventoryApi = new InventoryApi()
