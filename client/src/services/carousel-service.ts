import type { IResponse } from "@/types/api";
import { api } from "@/lib/axios";

const carouselURL = "/carousel";

const findAll = async (): Promise<IResponse> => {
  try {
    const data = await api.get(carouselURL);
    return {
      status: 200,
      success: true,
      data: data.data,
    };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      success: false,
      message: "Falha ao carregar a lista de banners",
      data: err.response?.data,
    };
  }
};

const save = async (item: any): Promise<IResponse> => {
  try {
    let response;
    if (item.id) {
      response = await api.put(`${carouselURL}/${item.id}`, item);
    } else {
      response = await api.post(carouselURL, item);
    }
    return { status: 200, success: true, message: "Banner salvo com sucesso", data: response.data };
  } catch (err: any) {
    return { 
      status: err.response?.status || 500, 
      success: false, 
      message: "Erro ao salvar banner", 
      data: err.response?.data 
    };
  }
};

const remove = async (id: number): Promise<IResponse> => {
  try {
    await api.delete(`${carouselURL}/${id}`);
    return { status: 204, success: true, message: "Banner removido com sucesso" };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao remover banner" };
  }
};

const CarouselService = {
  findAll,
  save,
  remove,
};

export default CarouselService;
