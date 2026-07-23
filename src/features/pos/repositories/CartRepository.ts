import { db, type CartItem } from '@/database/appDatabase'

class CartRepository {
  async getCart(): Promise<CartItem[]> {
    return await db.cart.toArray()
  }

  async addItem(productId: number, price: number) {
    const existing = await db.cart.where('productId').equals(productId).first()

    if (existing) {
      await db.cart.update(existing.id!, {
        qty: existing.qty + 1,
      })
    } else {
      await db.cart.add({
        productId,
        qty: 1,
        price,
      })
    }
  }

  async increase(id: number) {
    const item = await db.cart.get(id)
    if (item) {
      await db.cart.update(id, {
        qty: item.qty + 1,
      })
    }
  }

  async decrease(id: number) {
    const item = await db.cart.get(id)

    if (!item) return

    if (item.qty === 1) {
      await db.cart.delete(id)
    } else {
      await db.cart.update(id, {
        qty: item.qty - 1,
      })
    }
  }

  async clear() {
    await db.cart.clear()
  }
}

export const cartRepository = new CartRepository()
