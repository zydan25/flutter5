import type { Order, User } from './types';
import { createFlaskOrder, deleteFlaskCustomer, getFlaskCustomers, updateFlaskOrderStatus } from './api';

/**
 * Compatibility layer for the original storefront components.
 * The UI remains the original version, while persistence is handled by Flask.
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  await createFlaskOrder({
    ...order,
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    })),
  });
}

export async function fetchAllUsersFromFirestore(): Promise<User[]> {
  return (await getFlaskCustomers()) as User[];
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  await deleteFlaskCustomer(uid);
}

export async function updateOrderStatusInFirestore(orderId: string, status: Order['status'], isPaid?: boolean): Promise<void> {
  await updateFlaskOrderStatus(orderId, status, isPaid);
}
