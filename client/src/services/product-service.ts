import type { IResponse } from "@/types/api";
import { api } from "@/lib/axios";

const productURL = "/products";

const findAll = async (): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(productURL);
    response = {
      status: 200,
      success: true,
      message: "Lista de produtos carregada com sucesso!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response.status,
      success: false,
      message: "Falha ao carregar a lista de produtos",
      data: err.response.data,
    };
  }
  return response;
};

const findById = async (id: number): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(`${productURL}/${id}`);
    response = {
      status: 200,
      success: true,
      message: "Produto carregado com sucesso!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response.status,
      success: false,
      message: "Falha ao carregar o produto",
      data: err.response.data,
    };
  }
  return response;
};

const findByCategoryId = async (categoryId: number): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(`${productURL}/category/${categoryId}`);
    response = {
      status: 200,
      success: true,
      message: "Produtos da categoria carregados!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response?.status || 500,
      success: false,
      message: "Falha ao carregar produtos da categoria",
      data: err.response?.data,
    };
  }
  return response;
};

const search = async (query: string): Promise<IResponse> => {
  let response = {} as IResponse;
  try {
    const data = await api.get(`${productURL}/search`, {
      params: { query: query }
    });

    response = {
      status: 200,
      success: true,
      message: "Resultados da busca carregados!",
      data: data.data,
    };
  } catch (err: any) {
    response = {
      status: err.response?.status || 500,
      success: false,
      message: "Falha ao realizar a busca.",
      data: err.response?.data,
    };
  }
  return response;
};

const save = async (product: any): Promise<IResponse> => {
  try {
    let response;
    if (product.id) {
      response = await api.put(`${productURL}/${product.id}`, product);
    } else {
      response = await api.post(productURL, product);
    }
    return { status: 200, success: true, message: "Produto salvo com sucesso", data: response.data };
  } catch (err: any) {
    return { 
      status: err.response?.status || 500, 
      success: false, 
      message: "Erro ao salvar produto", 
      data: err.response?.data 
    };
  }
};

const remove = async (id: number): Promise<IResponse> => {
  try {
    await api.delete(`${productURL}/${id}`);
    return { status: 204, success: true, message: "Produto removido com sucesso" };
  } catch (err: any) {
    return { status: err.response?.status || 500, success: false, message: "Erro ao remover produto" };
  }
};

const ProductService = {
  findAll,
  findById,
  findByCategoryId,
  search,
  save,
  remove,
};

export default ProductService;