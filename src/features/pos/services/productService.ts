import { productApi } from '../api/productApi'
import { productRepository } from '../repositories/ProductRepository'

export async function loadProducts() {
  if (navigator.onLine) {
    try {
      const products = await productApi.getProducts()
      await productRepository.saveAll(products)
      return products
    } catch {
      console.log('API failed. Loading from IndexedDB.')
      return await productRepository.getAll()
    }
  }

  return await productRepository.getAll()
}
