export type UserRole = 'farmer' | 'owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
}

export interface Equipment {
  _id: string;
  ownerId?: User | string;
  equipmentName: string;
  category: string;
  description: string;
  pricePerDay: number;
  available: boolean;
  createdAt?: string;
}

export interface Booking {
  _id: string;
  equipmentId: Equipment | string;
  farmerId?: User | string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  createdAt?: string;
}
