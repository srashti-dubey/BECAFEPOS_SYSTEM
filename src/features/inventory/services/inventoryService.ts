import { inventoryApi } from '../api/inventoryApi'
import { inventoryRepository } from '../repositories/InventoryRepository'
import type { InventoryGlobal } from '@/database/appDatabase'

export async function saveInventory(item: Omit<InventoryGlobal, 'ID' | 'synced'>) {
  const record: InventoryGlobal = {
    ...item,
    ID: crypto.randomUUID(),
    synced: false,
  }

  if (navigator.onLine) {
    try {
      const synced = { ...record, synced: true, syc_datetime: new Date().toISOString() }
      await inventoryApi.saveInventory(synced)
      await inventoryRepository.save(synced)
      return synced
    } catch {
      console.log('API Failed. Saving Inventory Offline.')
    }
  }

  await inventoryRepository.save(record)
  return record
}

export async function syncPendingInventory() {
  if (!navigator.onLine) return

  const items = await inventoryRepository.getPendingInventory()

  if (!items.length) return

  console.log('Inventory Sync Started')

  for (const item of items) {
    try {
      const syncedAt = new Date().toISOString()
      await inventoryApi.saveInventory({ ...item, syc_datetime: syncedAt })
      await inventoryRepository.markSynced(item.ID, syncedAt)
      console.log(item.ID + ' Synced')
    } catch {
      console.log(item.ID + ' Failed')
    }
  }
}
