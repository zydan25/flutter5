import type { Order, User } from './types';
import {
  createFlaskOrder,
  deleteFlaskCustomer,
  getFlaskCustomers,
  getFlaskOrders,
  updateFlaskOrderStatus,
} from './api';

/**
 * Transitional compatibility module.
 *
 * The old public function names are kept temporarily so existing components
 * can be migrated safely without any Firebase SDK or Firestore calls.
 * All persistence now goes to Flask.
 */

export const firebaseConfig = null;
export const db = null;

export async function syncUserToFirestore(_user: User): Promise<void> {
  throw new Error('Legacy customer write is disabled. Use Flask OTP authentication via AuthModal.');
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  await deleteFlaskCustomer(uid);
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  await createFlaskOrder(order);
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  isPaid?: boolean,
): Promise<void> {
  await updateFlaskOrderStatus(orderId, status, isPaid);
}

export async function fetchAllUsersFromFirestore(): Promise<User[]> {
  return (await getFlaskCustomers()) as User[];
}

export async function fetchAllOrdersFromFirestore(): Promise<Order[]> {
  return (await getFlaskOrders()) as Order[];
}
