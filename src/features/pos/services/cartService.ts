import { cartRepository } from '../repositories/CartRepository'

const CART_UPDATED_EVENT = 'cart-updated'

export const cartService = {
  getCart() {
    return cartRepository.getCart()
  },

  async add(productId: number, price: number) {
    await cartRepository.addItem(productId, price)
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  },

  async increase(id: number) {
    await cartRepository.increase(id)
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  },

  async decrease(id: number) {
    await cartRepository.decrease(id)
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  },

  async clear() {
    await cartRepository.clear()
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  },
}

export function onCartUpdated(callback: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, callback)
  return () => window.removeEventListener(CART_UPDATED_EVENT, callback)
}
