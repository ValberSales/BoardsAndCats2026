import { api } from "@/lib/axios";
import type { IResponse } from "@/types/api";

const getMyOrders = async (): Promise<IResponse> => {
    try {
        const response = await api.get("/orders");
        return { status: 200, success: true, message: "Pedidos carregados", data: response.data };
    } catch (err: any) {
        return { status: err.response?.status || 500, success: false, message: "Erro ao carregar pedidos", data: err.response?.data };
    }
};

const getOrderById = async (id: number): Promise<IResponse> => {
    try {
        const response = await api.get(`/orders/${id}`);
        return { status: 200, success: true, message: "Pedido carregado", data: response.data };
    } catch (err: any) {
        return { status: err.response?.status || 500, success: false, message: "Erro ao carregar pedido", data: err.response?.data };
    }
};

const downloadDocument = async (orderId: number, docId: number, fileName: string) => {
  try {
    const response = await api.get(`/orders/${orderId}/documents/${docId}/download`, {
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
    console.error("Failed to download user document", docId, err);
  }
};

const OrderService = { getMyOrders, getOrderById, downloadDocument };
export default OrderService;