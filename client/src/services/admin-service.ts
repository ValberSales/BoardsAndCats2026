import { api } from "@/lib/axios";
import type { IResponse } from "@/types/api";

export interface IAdminUser {
  id: number;
  username: string;
  displayName: string;
  phone: string;
  cpf: string;
  enabled: boolean;
  role: "USER" | "ADMIN";
}

export interface IAdminOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IAdminAttachment {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface IAdminOrder {
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
  items: IAdminOrderItem[];
  attachments: IAdminAttachment[];
}

const getUsers = async (): Promise<IResponse> => {
  try {
    const response = await api.get("/admin/users");
    const mapped = (response.data || []).map((u: any) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      phone: u.phone,
      cpf: u.cpf,
      enabled: u.active,
      role: u.role,
    }));
    return { status: 200, success: true, message: "Usuários carregados", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao carregar usuários", data: err.response?.data };
  }
};

const updateUserActive = async (id: number): Promise<IResponse> => {
  try {
    const response = await api.put(`/admin/users/${id}/toggle-active`);
    const u = response.data;
    const mapped = {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      phone: u.phone,
      cpf: u.cpf,
      enabled: u.active,
      role: u.role,
    };
    return { status: 200, success: true, message: "Status do usuário atualizado", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao atualizar status", data: err.response?.data };
  }
};

const updateUserRole = async (id: number, role: "USER" | "ADMIN"): Promise<IResponse> => {
  try {
    const response = await api.put(`/admin/users/${id}/role`, null, {
      params: { role }
    });
    const u = response.data;
    const mapped = {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      phone: u.phone,
      cpf: u.cpf,
      enabled: u.active,
      role: u.role,
    };
    return { status: 200, success: true, message: "Perfil do usuário atualizado", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao atualizar papel do usuário", data: err.response?.data };
  }
};

const mapOrder = (o: any, docs: any[] = []): IAdminOrder => {
  return {
    id: o.id,
    date: o.date ? String(o.date) : "",
    total: o.total || 0,
    shipping: o.shipping || 0,
    discount: o.discount || 0,
    status: o.status,
    trackingCode: o.trackingCode || undefined,
    clientName: o.clientDetails?.name || "",
    clientEmail: o.clientDetails?.email || "",
    clientCpf: o.clientDetails?.cpf || "",
    clientPhone: o.clientDetails?.phone || "",
    shippingAddress: {
      street: o.address?.street || "",
      number: o.address?.number || "",
      neighborhood: o.address?.neighborhood || "",
      city: o.address?.city || "",
      state: o.address?.state || "",
      zip: o.address?.zip || "",
    },
    paymentMethod: o.payment?.description || "",
    items: (o.items || []).map((item: any) => ({
      id: item.id,
      productName: item.product?.name || "Produto Desconhecido",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
    attachments: docs.map((d: any) => ({
      id: String(d.id),
      name: d.fileName,
      uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString("pt-BR") : "",
    })),
  };
};

const getOrders = async (): Promise<IResponse> => {
  try {
    const response = await api.get("/admin/orders");
    const mapped = (response.data || []).map((o: any) => mapOrder(o));
    return { status: 200, success: true, message: "Pedidos carregados", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao carregar pedidos", data: err.response?.data };
  }
};

const getOrderById = async (id: number): Promise<IResponse> => {
  try {
    const orderResponse = await api.get(`/admin/orders/${id}`);
    let docs: any[] = [];
    try {
      const docsResponse = await api.get(`/admin/orders/${id}/documents`);
      if (docsResponse.data) {
        docs = docsResponse.data;
      }
    } catch (e) {
      console.warn("Failed to fetch documents for order", id, e);
    }
    const mapped = mapOrder(orderResponse.data, docs);
    return { status: 200, success: true, message: "Pedido carregado", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao carregar pedido", data: err.response?.data };
  }
};

const updateOrderStatus = async (id: number, status: string, trackingCode?: string): Promise<IResponse> => {
  try {
    const response = await api.put(`/admin/orders/${id}/status`, null, {
      params: { status, trackingCode }
    });
    let docs: any[] = [];
    try {
      const docsResponse = await api.get(`/admin/orders/${id}/documents`);
      if (docsResponse.data) {
        docs = docsResponse.data;
      }
    } catch (e) {
      console.warn("Failed to fetch documents for order", id, e);
    }
    const mapped = mapOrder(response.data, docs);
    return { status: 200, success: true, message: "Status do pedido atualizado", data: mapped };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao atualizar status do pedido", data: err.response?.data };
  }
};

const uploadOrderDocument = async (orderId: number, file: File): Promise<IResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/admin/orders/${orderId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { status: 201, success: true, message: "Documento anexado com sucesso", data: response.data };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao anexar documento", data: err.response?.data };
  }
};

const downloadDocument = async (docId: string, fileName: string) => {
  try {
    const response = await api.get(`/admin/orders/documents/${docId}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download document", docId, err);
  }
};

const getDashboardStats = async (): Promise<IResponse> => {
  try {
    const response = await api.get("/admin/orders/dashboard/stats");
    return { status: 200, success: true, message: "Estatísticas carregadas", data: response.data };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao carregar estatísticas", data: err.response?.data };
  }
};

const AdminService = {
  getUsers,
  updateUserActive,
  updateUserRole,
  getOrders,
  getOrderById,
  updateOrderStatus,
  uploadOrderDocument,
  downloadDocument,
  getDashboardStats,
};

export default AdminService;
