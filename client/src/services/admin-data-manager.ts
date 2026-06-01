export interface MockUser {
  id: number;
  username: string;
  displayName: string;
  phone: string;
  cpf: string;
  enabled: boolean;
  role: "USER" | "ADMIN";
}

export interface MockOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface MockAttachment {
  id: string;
  name: string;
  uploadedAt: string;
  dataUrl?: string; // Base64 content to download/view
}

export interface MockOrder {
  id: number;
  date: string;
  total: number;
  shipping: number;
  discount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";
  trackingCode?: string;
  clientName: string;
  clientEmail: string;
  clientCpf: string;
  clientPhone: string;
  shippingAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string;
  items: MockOrderItem[];
  attachments: MockAttachment[];
}

const INITIAL_USERS: MockUser[] = [
  {
    id: 1,
    username: "joao.silva@email.com",
    displayName: "João Silva",
    phone: "46999998888",
    cpf: "111.111.111-11",
    enabled: true,
    role: "ADMIN",
  },
  {
    id: 2,
    username: "ana.souza@email.com",
    displayName: "Ana Souza",
    phone: "46988887777",
    cpf: "222.222.222-22",
    enabled: true,
    role: "USER",
  },
  {
    id: 3,
    username: "carlos.santos@email.com",
    displayName: "Carlos Santos",
    phone: "46977776666",
    cpf: "333.333.333-33",
    enabled: false,
    role: "USER",
  },
  {
    id: 4,
    username: "maria.lima@email.com",
    displayName: "Maria Lima",
    phone: "46966665555",
    cpf: "444.444.444-44",
    enabled: true,
    role: "USER",
  },
];

const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 1,
    date: "2025-11-27",
    total: 104.90,
    shipping: 15.00,
    discount: 0.00,
    status: "PENDING",
    clientName: "João Silva",
    clientEmail: "joao.silva@email.com",
    clientCpf: "111.111.111-11",
    clientPhone: "46999998888",
    shippingAddress: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85501-100",
    },
    paymentMethod: "CREDIT_CARD - Visa final 4242",
    items: [
      { id: 1, productName: "Codenames", quantity: 1, unitPrice: 89.90, subtotal: 89.90 },
    ],
    attachments: [],
  },
  {
    id: 2,
    date: "2025-10-10",
    total: 159.90,
    shipping: 20.00,
    discount: 10.00,
    status: "DELIVERED",
    trackingCode: "BR123456789",
    clientName: "Ana Souza",
    clientEmail: "ana.souza@email.com",
    clientCpf: "222.222.222-22",
    clientPhone: "46988887777",
    shippingAddress: {
      street: "Avenida Brasil",
      number: "2024",
      neighborhood: "La Salle",
      city: "Pato Branco",
      state: "PR",
      zip: "85502-200",
    },
    paymentMethod: "PIX - Chave aleatória",
    items: [
      { id: 2, productName: "Azul", quantity: 1, unitPrice: 149.90, subtotal: 149.90 },
    ],
    attachments: [],
  },
  {
    id: 3,
    date: "2025-11-20",
    total: 217.90,
    shipping: 18.00,
    discount: 0.00,
    status: "SHIPPED",
    trackingCode: "BR987654321",
    clientName: "Carlos Santos",
    clientEmail: "carlos.santos@email.com",
    clientCpf: "333.333.333-33",
    clientPhone: "46977776666",
    shippingAddress: {
      street: "Rua da Paz",
      number: "456",
      neighborhood: "Industrial",
      city: "Pato Branco",
      state: "PR",
      zip: "85503-300",
    },
    paymentMethod: "CREDIT_CARD - Mastercard final 5555",
    items: [
      { id: 3, productName: "Ticket to Ride", quantity: 1, unitPrice: 199.90, subtotal: 199.90 },
    ],
    attachments: [],
  },
  {
    id: 4,
    date: "2025-11-28",
    total: 41.90,
    shipping: 12.00,
    discount: 0.00,
    status: "PENDING",
    clientName: "Maria Lima",
    clientEmail: "maria.lima@email.com",
    clientCpf: "444.444.444-44",
    clientPhone: "46966665555",
    shippingAddress: {
      street: "Avenida Tupi",
      number: "1000",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85504-400",
    },
    paymentMethod: "BOLETO - Boleto Bancário",
    items: [
      { id: 4, productName: "UNO", quantity: 1, unitPrice: 29.90, subtotal: 29.90 },
    ],
    attachments: [],
  },
  {
    id: 5,
    date: "2025-11-27",
    total: 136.90,
    shipping: 12.00,
    discount: 5.00,
    status: "PAID",
    clientName: "Maria Lima",
    clientEmail: "maria.lima@email.com",
    clientCpf: "444.444.444-44",
    clientPhone: "46966665555",
    shippingAddress: {
      street: "Avenida Tupi",
      number: "1000",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85504-400",
    },
    paymentMethod: "BOLETO - Boleto Bancário",
    items: [
      { id: 5, productName: "Carcassonne", quantity: 1, unitPrice: 129.90, subtotal: 129.90 },
    ],
    attachments: [],
  },
  {
    id: 6,
    date: "2025-11-25",
    total: 314.90,
    shipping: 15.00,
    discount: 0.00,
    status: "SHIPPED",
    trackingCode: "TRK11223344",
    clientName: "Maria Lima",
    clientEmail: "maria.lima@email.com",
    clientCpf: "444.444.444-44",
    clientPhone: "46966665555",
    shippingAddress: {
      street: "Avenida Tupi",
      number: "1000",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85504-400",
    },
    paymentMethod: "BOLETO - Boleto Bancário",
    items: [
      { id: 6, productName: "Terra Mystica", quantity: 1, unitPrice: 299.90, subtotal: 299.90 },
    ],
    attachments: [],
  },
  {
    id: 7,
    date: "2025-10-01",
    total: 479.90,
    shipping: 0.00,
    discount: 20.00,
    status: "DELIVERED",
    trackingCode: "TRK55667788",
    clientName: "Maria Lima",
    clientEmail: "maria.lima@email.com",
    clientCpf: "444.444.444-44",
    clientPhone: "46966665555",
    shippingAddress: {
      street: "Avenida Tupi",
      number: "1000",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85504-400",
    },
    paymentMethod: "BOLETO - Boleto Bancário",
    items: [
      { id: 7, productName: "Gloomhaven", quantity: 1, unitPrice: 499.90, subtotal: 499.90 },
    ],
    attachments: [],
  },
  {
    id: 8,
    date: "2025-09-15",
    total: 139.90,
    shipping: 10.00,
    discount: 0.00,
    status: "CANCELED",
    clientName: "Maria Lima",
    clientEmail: "maria.lima@email.com",
    clientCpf: "444.444.444-44",
    clientPhone: "46966665555",
    shippingAddress: {
      street: "Avenida Tupi",
      number: "1000",
      neighborhood: "Centro",
      city: "Pato Branco",
      state: "PR",
      zip: "85504-400",
    },
    paymentMethod: "BOLETO - Boleto Bancário",
    items: [
      { id: 8, productName: "Magic: The Gathering", quantity: 1, unitPrice: 129.90, subtotal: 129.90 },
    ],
    attachments: [],
  },
];

const getStoredData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setStoredData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const AdminDataManager = {
  getUsers: (): MockUser[] => {
    return getStoredData("admin_mock_users", INITIAL_USERS);
  },

  updateUserActive: (id: number, enabled: boolean): MockUser[] => {
    const users = AdminDataManager.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].enabled = enabled;
      setStoredData("admin_mock_users", users);
    }
    return users;
  },

  updateUserRole: (id: number, role: "USER" | "ADMIN"): MockUser[] => {
    const users = AdminDataManager.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].role = role;
      setStoredData("admin_mock_users", users);
    }
    return users;
  },

  getOrders: (): MockOrder[] => {
    return getStoredData("admin_mock_orders", INITIAL_ORDERS);
  },

  getOrderById: (id: number): MockOrder | undefined => {
    const orders = AdminDataManager.getOrders();
    return orders.find(o => o.id === id);
  },

  updateOrderStatus: (
    id: number,
    status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED",
    trackingCode?: string
  ): MockOrder | undefined => {
    const orders = AdminDataManager.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      if (trackingCode !== undefined) {
        orders[index].trackingCode = trackingCode;
      }
      setStoredData("admin_mock_orders", orders);
      return orders[index];
    }
    return undefined;
  },

  addOrderAttachment: (id: number, name: string, dataUrl: string): MockAttachment | undefined => {
    const orders = AdminDataManager.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      const newAttachment: MockAttachment = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        uploadedAt: new Date().toLocaleDateString("pt-BR"),
        dataUrl,
      };
      orders[index].attachments = [...(orders[index].attachments || []), newAttachment];
      setStoredData("admin_mock_orders", orders);
      return newAttachment;
    }
    return undefined;
  },

  getDashboardTotalizers: () => {
    const orders = AdminDataManager.getOrders();
    const totals = {
      PENDING: 0,
      PAID: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELED: 0,
    };
    orders.forEach(o => {
      if (totals[o.status] !== undefined) {
        totals[o.status]++;
      }
    });
    return totals;
  },
};
