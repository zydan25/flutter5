export interface OperationItem {
  id: string | number;
  operationNumber: string;
  phone: string;
  customerName: string;
  operatorName: string;
  packageName: string;
  amount: number;
  fee: number;
  totalCost: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
  time: string;
  status: "success" | "pending" | "failed";
  statusText: string;
  isRealVerified: boolean;
  notes?: string;
}

export interface StatementEntry {
  id: string;
  date: string;
  time: string;
  type: "deposit" | "payment" | "transfer_out" | "transfer_in" | "fee";
  title: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  refNumber: string;
}

export interface UserProfile {
  id: number;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  governorate: string;
  role: string;
  pointsBalance: number;
  balanceYer: number;
  balanceSar: number;
  balanceUsd: number;
  balance?: number;
  verified?: boolean;
}

export interface StoreProduct {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  storeName: string;
  category: string;
  image: string;
  rating: number;
  stock: number;
  sku?: string;
  brand?: string;
  description?: string;
  isTrending?: boolean;
}

export interface UserAddress {
  id: string | number;
  title?: string;
  recipientName?: string;
  governorate?: string;
  city: string;
  district?: string;
  streetDetails: string;
  phone: string;
  notes?: string;
  isDefault?: boolean;
}

export interface StoreOrder {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  statusText: string;
  date: string;
  vendorName: string;
  shippingAddress?: string;
  canEdit?: boolean;
  items: Array<{
    id: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }>;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}


