import type { IResponse } from "@/types/api";
import { api } from "@/lib/axios";


const categoryURL = "/categories";

const findAll = async (): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(categoryURL);
    response = {
      status: 200,
      success: true,
      message: "Lista de categorias carregada com sucesso!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response.status,
      success: false,
      message: "Falha ao carregar a lista de categorias",
      data: err.response.data,
    };
  }
  return response;
};

const findById = async (id: number): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(`${categoryURL}/${id}`);
    response = {
      status: 200,
      success: true,
      message: "Categoria carregada com sucesso!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response.status,
      success: false,
      message: "Falha ao carregar categoria",
      data: err.response.data,
    };
  }
  return response;
};

const save = async (category: any): Promise<IResponse> => {
  try {
    let response;
    if (category.id) {
      response = await api.put(`${categoryURL}/${category.id}`, category);
    } else {
      response = await api.post(categoryURL, category);
    }
    return { status: 200, success: true, message: "Categoria salva com sucesso", data: response.data };
  } catch (err: any) {
    return { 
      status: err.response?.status || 500, 
      success: false, 
      message: "Erro ao salvar categoria", 
      data: err.response?.data 
    };
  }
};

const remove = async (id: number): Promise<IResponse> => {
  try {
    await api.delete(`${categoryURL}/${id}`);
    return { status: 204, success: true, message: "Categoria removida com sucesso" };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao remover categoria" };
  }
};

const CategoryService = {
  findAll,
  findById,
  save,
  remove,
};

export default CategoryService;