import { orderRepository } from "../repositories/OrderRepository";
import { orderApi } from "../api/orderApi";

export async function syncPendingOrders() {

    if (!navigator.onLine) return;

    const orders = await orderRepository.getPendingOrders();

    if (!orders.length) return;

    console.log("Sync Started");

    for (const order of orders) {

        try {

            await orderApi.saveOrder(order);

            await orderRepository.markSynced(order.id!);

            console.log(order.orderNo + " Synced");

        } catch (err) {

            console.log(order.orderNo + " Failed");

        }

    }

}