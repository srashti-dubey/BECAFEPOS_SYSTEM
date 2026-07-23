import { db, type Product } from "@/database/appDatabase";

export class ProductRepository {

  async saveAll(products: Product[]) {
    await db.products.clear();
    await db.products.bulkPut(products);
  }

  async getAll(): Promise<Product[]> {
    return await db.products.toArray();
  }

  async search(keyword: string) {
    return db.products
      .filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      )
      .toArray();
  }

  async getByCategory(category: string) {
    return db.products
      .where("category")
      .equals(category)
      .toArray();
  }
}

export const productRepository = new ProductRepository();