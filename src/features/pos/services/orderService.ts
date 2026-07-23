import { orderApi } from "../api/orderApi";
import { orderRepository } from "../repositories/OrderRepository";

export async function saveOrder(order: any) {

  if (navigator.onLine) {

    try {

      await orderApi.saveOrder(order);

      order.synced = true;

      await orderRepository.save(order);

      return;

    } catch (err) {

      console.log("API Failed. Saving Offline.");

    }

  }

  order.synced = false;

  await orderRepository.save(order);

}