import { db, type InventoryGlobal } from '@/database/appDatabase'

class InventoryRepository {
  save(item: InventoryGlobal) {
    return db.inventory.add(item)
  }

  getAll() {
    return db.inventory.toArray()
  }

  getPendingInventory() {
    return db.inventory.filter((item) => !item.synced).toArray()
  }

  markSynced(id: string, syncedAt: string) {
    return db.inventory.update(id, {
      synced: true,
      syc_datetime: syncedAt,
    })
  }
}

export const inventoryRepository = new InventoryRepository()
