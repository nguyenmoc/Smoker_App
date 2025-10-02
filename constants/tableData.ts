export interface Table {
  id: string;
  number: number;
  type: 'vip' | 'luxury' | 'thường';
  status: 'trống' | 'đang sử dụng' | 'đã đặt';
  capacity: number;
  customer?: Customer;
  currentOrder?: Order;
}

export interface Customer {
  name: string;
  phone: string;
  bookingTime?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  startTime: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Revenue {
  id: string;
  tableId: string;
  tableNumber: number;
  amount: number;
  date: string;
  items: OrderItem[];
}

export const tableTypes = [
  { value: 'thường', label: 'Bàn Thường', color: '#6b7280' },
  { value: 'vip', label: 'Bàn VIP', color: '#f59e0b' },
  { value: 'luxury', label: 'Bàn Luxury', color: '#8b5cf6' },
];

export const mockTables: Table[] = [
  { 
    id: '1', 
    number: 1, 
    type: 'thường', 
    status: 'trống', 
    capacity: 4 
  },
  { 
    id: '2', 
    number: 2, 
    type: 'vip', 
    status: 'đang sử dụng', 
    capacity: 6,
    customer: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
    },
    currentOrder: {
      id: 'order1',
      items: [
        { name: 'Mojito', quantity: 3, price: 150000 },
        { name: 'Whiskey', quantity: 2, price: 450000 },
        { name: 'Snacks', quantity: 1, price: 200000 },
      ],
      total: 1350000,
      startTime: '2025-10-02T19:30:00Z',
    }
  },
  { 
    id: '3', 
    number: 3, 
    type: 'luxury', 
    status: 'đã đặt', 
    capacity: 8,
    customer: {
      name: 'Trần Thị B',
      phone: '0912345678',
      bookingTime: '2025-10-02T21:00:00Z',
    }
  },
  { 
    id: '4', 
    number: 4, 
    type: 'thường', 
    status: 'trống', 
    capacity: 4 
  },
  { 
    id: '5', 
    number: 5, 
    type: 'vip', 
    status: 'đang sử dụng', 
    capacity: 6,
    customer: {
      name: 'Lê Văn C',
      phone: '0923456789',
    },
    currentOrder: {
      id: 'order2',
      items: [
        { name: 'Cocktail Premium', quantity: 4, price: 200000 },
        { name: 'Champagne', quantity: 1, price: 1500000 },
      ],
      total: 2300000,
      startTime: '2025-10-02T20:00:00Z',
    }
  },
];

// Thêm nhiều data cho biểu đồ
export const mockRevenues: Revenue[] = [
  // Hôm nay
  {
    id: '1',
    tableId: '2',
    tableNumber: 2,
    amount: 1350000,
    date: '2025-10-02T20:00:00Z',
    items: [
      { name: 'Mojito', quantity: 3, price: 150000 },
      { name: 'Whiskey', quantity: 2, price: 450000 },
    ],
  },
  {
    id: '2',
    tableId: '5',
    tableNumber: 5,
    amount: 2300000,
    date: '2025-10-02T19:30:00Z',
    items: [
      { name: 'Cocktail Premium', quantity: 4, price: 200000 },
      { name: 'Champagne', quantity: 1, price: 1500000 },
    ],
  },
  {
    id: '3',
    tableId: '3',
    tableNumber: 3,
    amount: 950000,
    date: '2025-10-02T21:30:00Z',
    items: [
      { name: 'Beer', quantity: 8, price: 80000 },
      { name: 'Pizza', quantity: 1, price: 310000 },
    ],
  },
  // Hôm qua
  {
    id: '4',
    tableId: '2',
    tableNumber: 2,
    amount: 1800000,
    date: '2025-10-01T20:00:00Z',
    items: [
      { name: 'Wine', quantity: 2, price: 600000 },
      { name: 'Steak', quantity: 2, price: 300000 },
    ],
  },
  {
    id: '5',
    tableId: '1',
    tableNumber: 1,
    amount: 450000,
    date: '2025-10-01T19:00:00Z',
    items: [
      { name: 'Beer', quantity: 6, price: 75000 },
    ],
  },
  // Tuần này
  {
    id: '6',
    tableId: '5',
    tableNumber: 5,
    amount: 3200000,
    date: '2025-09-30T21:00:00Z',
    items: [
      { name: 'Champagne Dom Perignon', quantity: 1, price: 3200000 },
    ],
  },
  {
    id: '7',
    tableId: '3',
    tableNumber: 3,
    amount: 1200000,
    date: '2025-09-29T20:00:00Z',
    items: [
      { name: 'Cocktail Mix', quantity: 6, price: 200000 },
    ],
  },
  {
    id: '8',
    tableId: '2',
    tableNumber: 2,
    amount: 890000,
    date: '2025-09-28T19:30:00Z',
    items: [
      { name: 'Vodka', quantity: 3, price: 180000 },
      { name: 'Snacks', quantity: 2, price: 175000 },
    ],
  },
  {
    id: '9',
    tableId: '4',
    tableNumber: 4,
    amount: 650000,
    date: '2025-09-27T18:00:00Z',
    items: [
      { name: 'Beer Tower', quantity: 2, price: 325000 },
    ],
  },
  {
    id: '10',
    tableId: '1',
    tableNumber: 1,
    amount: 1150000,
    date: '2025-09-26T20:30:00Z',
    items: [
      { name: 'Whiskey', quantity: 3, price: 350000 },
      { name: 'Sushi Set', quantity: 1, price: 400000 },
    ],
  },
];