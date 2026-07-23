import Dexie, { type Table } from 'dexie'

export interface Role {
  id: string
  name: string
  isActive: boolean
}
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  qty: number;
  price: number;
}

export interface Order {
  id?: number;
  orderNo: string;
  items: CartItem[];
  total: number;
  synced: boolean;
}

export interface PendingSync {
  id?: number;
  type: string;
  payload: any;
}
export async function getProduct(id: number) {
  return db.products.get(id);
}
class AppDatabase extends Dexie {
  roles!: Table<Role, string>
  products!: Table<Product, number>
  cart!: Table<CartItem, number>
  orders!: Table<Order, number>
  pendingSync!: Table<PendingSync, number>

  constructor() {
    super('BeCafeDB')

    console.log('Dexie constructor called')

    this.version(11).stores({
      roles: 'id,name,isActive',
      products: "id,name,category",
      cart: "++id,productId",
      orders: "++id,orderNo,synced",
      pendingSync: "++id,type"
    })

    this.open()
      .then(() => {
        console.log('Dexie DB opened successfully')
      })
      .catch((error) => {
        console.error('Dexie open error:', error)
      })
  }
}

export const db = new AppDatabase()