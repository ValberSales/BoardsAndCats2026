import { api } from "@/lib/axios";
import type { IResponse } from "@/types/api";

const getLogs = async (lines: number = 150): Promise<IResponse> => {
  try {
    const response = await api.get("/admin/logs", {
      params: { lines }
    });
    return { status: 200, success: true, message: "Logs carregados", data: response.data };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao carregar logs", data: err.response?.data };
  }
};

const LogService = {
  getLogs,
};

export default LogService;
