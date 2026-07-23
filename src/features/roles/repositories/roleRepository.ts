import { db } from '@/database/appDatabase'
import type { Role } from '@/database/appDatabase'

export const roleRepository = {
  saveAll: async (roles: Role[]): Promise<void> => {
    try {
      console.log('Saving roles to Dexie:', roles)

      if (!roles || roles.length === 0) {
        console.warn('No roles received to save.')
        return
      }

      await db.transaction('rw', db.roles, async () => {
        await db.roles.clear()
        await db.roles.bulkPut(roles)
      })

      const savedRoles = await db.roles.toArray()
      console.log('Roles saved in Dexie:', savedRoles)
    } catch (error) {
      console.error('Error saving roles:', error)
    }
  },

  save: async (role: Role): Promise<void> => {
    await db.roles.put(role)
  },

  create: async (role: Role): Promise<void> => {
    await db.roles.add(role)
  },

  update: async (role: Role): Promise<void> => {
    await db.roles.put(role)
  },

  getAll: async (): Promise<Role[]> => {
    const roles = await db.roles.toArray()
    console.log('Roles fetched from Dexie:', roles)
    return roles
  },

  getById: async (id: string): Promise<Role | undefined> => {
    return db.roles.get(id)
  },

  delete: async (id: string): Promise<void> => {
    await db.roles.delete(id)
  },

  clear: async (): Promise<void> => {
    await db.roles.clear()
  },
}