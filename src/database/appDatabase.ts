import Dexie, { type Table } from 'dexie'

export interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
}

export interface CartItem {
  id?: number
  productId: number
  qty: number
  price: number
}

export interface Order {
  id?: number
  orderNo: string
  items: CartItem[]
  total: number
  synced: boolean
}

export async function getProduct(id: number) {
  return db.products.get(id)
}

class AppDatabase extends Dexie {
  products!: Table<Product, number>
  cart!: Table<CartItem, number>
  orders!: Table<Order, number>

  constructor() {
    super('BeCafeDB')

    this.version(12).stores({
      products: 'id,name,category',
      cart: '++id,productId',
      orders: '++id,orderNo,synced',
    })

    this.open().catch((error) => {
      console.error('Dexie open error:', error)
    })
  }
}

export const db = new AppDatabase()