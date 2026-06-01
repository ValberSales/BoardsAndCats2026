import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputSwitch } from "primereact/inputswitch";
import { BreadCrumb } from "primereact/breadcrumb";
import { Divider } from "primereact/divider";
import { API_BASE_URL } from "@/lib/axios";
import ProductService from "@/services/product-service";
import CategoryService from "@/services/category-service";
import MediaService from "@/services/media-service";

interface ICategory {
  id: number;
  name: string;
}

interface IProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  promo: boolean;
  stock: number;
  mechanics?: string;
  players?: string;
  editor?: string;
  category: { id: number; name?: string };
  imageUrl: string;
  otherImages: string[];
  duracao?: string;
  idadeRecomendada?: string;
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const emptyProduct: IProduct = {
    name: "",
    description: "",
    price: 0,
    promo: false,
    stock: 0,
    category: { id: 1 },
    imageUrl: "",
    otherImages: [],
    mechanics: "",
    players: "",
    editor: "",
    duracao: "",
    idadeRecomendada: ""
  };

  const [product, setProduct] = useState<IProduct>(emptyProduct);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Catálogo de Produtos" }
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const response = await ProductService.findAll();
    if (response.success && Array.isArray(response.data)) {
      setProducts(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao buscar produtos.",
        life: 3000
      });
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const response = await CategoryService.findAll();
    if (response.success && Array.isArray(response.data)) {
      setCategories(response.data);
    }
  };

  const openNew = () => {
    setProduct({ ...emptyProduct, category: { id: categories[0]?.id || 1 } });
    setSubmitted(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setProductDialog(false);
    setSubmitted(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const saveProduct = async () => {
    setSubmitted(true);

    if (product.name.trim() && product.price > 0 && product.imageUrl) {
      // JPA requires Category object to match database relations
      const payload = {
        ...product,
        category: { id: product.category.id }
      };

      const response = await ProductService.save(payload);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: product.id ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
          life: 3000
        });
        loadProducts();
        setProductDialog(false);
        setProduct(emptyProduct);
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro ao Salvar",
          detail: response.message || "Verifique se o nome do produto é único.",
          life: 4000
        });
      }
    }
  };

  const editProduct = (prod: IProduct) => {
    setProduct({
      ...prod,
      otherImages: prod.otherImages || []
    });
    setProductDialog(true);
  };

  const confirmDeleteProduct = (prod: IProduct) => {
    setProduct(prod);
    setDeleteDialog(true);
  };

  const deleteProduct = async () => {
    if (product.id) {
      const response = await ProductService.remove(product.id);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto excluído com sucesso!",
          life: 3000
        });
        loadProducts();
        setDeleteDialog(false);
        setProduct(emptyProduct);
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível excluir o produto.",
          life: 3000
        });
      }
    }
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    try {
      const filename = await MediaService.upload(file);
      setProduct({ ...product, imageUrl: `/media/${filename}` });
      toastRef.current?.show({ severity: "success", summary: "Sucesso", detail: "Imagem principal enviada!", life: 1500 });
    } catch (err) {
      toastRef.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao enviar imagem principal.", life: 3000 });
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const filename = await MediaService.upload(files[i]);
        newUrls.push(`/media/${filename}`);
      }
      setProduct({
        ...product,
        otherImages: [...product.otherImages, ...newUrls]
      });
      toastRef.current?.show({ severity: "success", summary: "Sucesso", detail: "Imagens adicionadas à galeria!", life: 1500 });
    } catch (err) {
      toastRef.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao enviar imagens secundárias.", life: 3000 });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setProduct({
      ...product,
      otherImages: product.otherImages.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Datatable templates
  const imageBodyTemplate = (rowData: IProduct) => {
    return (
      <img
        src={`${API_BASE_URL}${rowData.imageUrl}`}
        alt={rowData.name}
        className="shadow-2 border-round"
        style={{ width: "45px", height: "45px", objectFit: "cover" }}
      />
    );
  };

  const priceBodyTemplate = (rowData: IProduct) => {
    return rowData.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const promoBodyTemplate = (rowData: IProduct) => {
    return (
      <span className={`font-semibold ${rowData.promo ? "text-green-600" : "text-500"}`}>
        {rowData.promo ? "Sim" : "Não"}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: IProduct) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => editProduct(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDeleteProduct(rowData)} />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" onClick={saveProduct} disabled={uploadingMain || uploadingGallery} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
      <Button label="Sim, Excluir" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-5 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0">Catálogo de Produtos</h1>
          <p className="text-600 m-0 mt-1">Crie, modifique e organize o inventário da loja.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Voltar ao Painel" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => navigate("/admin/dashboard")} />
          <Button label="Novo Produto" icon="pi pi-plus" onClick={openNew} />
        </div>
      </div>

      <div className="surface-card shadow-2 border-round p-4">
        <DataTable
          value={products}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhum produto cadastrado."
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column field="id" header="ID" sortable style={{ width: "8%" }} />
          <Column header="Imagem" body={imageBodyTemplate} style={{ width: "10%" }} />
          <Column field="name" header="Nome" sortable style={{ width: "25%" }} />
          <Column field="category.name" header="Categoria" sortable style={{ width: "15%" }} />
          <Column field="price" header="Preço" body={priceBodyTemplate} sortable style={{ width: "12%" }} />
          <Column field="stock" header="Estoque" sortable style={{ width: "10%" }} />
          <Column field="promo" header="Oferta" body={promoBodyTemplate} sortable style={{ width: "10%" }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ width: "10%" }} />
        </DataTable>
      </div>

      {/* Cadastro / Edição de Produto */}
      <Dialog
        visible={productDialog}
        style={{ width: "800px" }}
        header={product.id ? "Editar Produto" : "Novo Produto"}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="grid">
          {/* Informações Gerais */}
          <div className="col-12 md:col-6 p-2">
            <h3 className="text-lg font-bold mb-3">Informações Gerais</h3>
            
            <div className="field mb-3">
              <label htmlFor="prod-name" className="font-bold mb-1 block">Nome do Produto *</label>
              <InputText
                id="prod-name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
                className={submitted && !product.name ? "p-invalid" : ""}
              />
              {submitted && !product.name && <small className="p-error block mt-1">Nome é obrigatório.</small>}
            </div>

            <div className="field mb-3">
              <label htmlFor="description" className="font-bold mb-1 block">Descrição</label>
              <InputTextarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                rows={3}
                autoResize
              />
            </div>

            <div className="grid">
              <div className="col-6 field mb-3">
                <label htmlFor="price" className="font-bold mb-1 block">Preço (R$) *</label>
                <InputNumber
                  id="price"
                  value={product.price}
                  onValueChange={(e) => setProduct({ ...product, price: e.value || 0 })}
                  mode="decimal"
                  minFractionDigits={2}
                  className={submitted && product.price <= 0 ? "p-invalid" : ""}
                />
                {submitted && product.price <= 0 && <small className="p-error block mt-1">Preço deve ser maior que zero.</small>}
              </div>

              <div className="col-6 field mb-3">
                <label htmlFor="stock" className="font-bold mb-1 block">Estoque *</label>
                <InputNumber
                  id="stock"
                  value={product.stock}
                  onValueChange={(e) => setProduct({ ...product, stock: e.value || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid align-items-center">
              <div className="col-6 field mb-3">
                <label htmlFor="category" className="font-bold mb-1 block">Categoria *</label>
                <Dropdown
                  id="category"
                  value={product.category.id}
                  options={categories}
                  optionValue="id"
                  optionLabel="name"
                  onChange={(e) => setProduct({ ...product, category: { id: e.value } })}
                />
              </div>

              <div className="col-6 field mb-3 flex align-items-center justify-content-between pt-4">
                <span className="font-bold">Colocar em Oferta?</span>
                <InputSwitch
                  checked={product.promo}
                  onChange={(e) => setProduct({ ...product, promo: e.value })}
                />
              </div>
            </div>
          </div>

          {/* Ficha Técnica e Imagens */}
          <div className="col-12 md:col-6 p-2 border-left-none md:border-left-1 border-200">
            <h3 className="text-lg font-bold mb-3">Ficha Técnica & Mídias</h3>

            <div className="grid">
              <div className="col-6 field mb-3">
                <label htmlFor="players" className="font-bold mb-1 block">Jogadores</label>
                <InputText
                  id="players"
                  value={product.players || ""}
                  onChange={(e) => setProduct({ ...product, players: e.target.value })}
                  placeholder="Ex: 2-5"
                />
              </div>

              <div className="col-6 field mb-3">
                <label htmlFor="editor" className="font-bold mb-1 block">Editora</label>
                <InputText
                  id="editor"
                  value={product.editor || ""}
                  onChange={(e) => setProduct({ ...product, editor: e.target.value })}
                  placeholder="Ex: Feuerland"
                />
              </div>
            </div>

            <div className="grid">
              <div className="col-6 field mb-3">
                <label htmlFor="duracao" className="font-bold mb-1 block">Duração</label>
                <InputText
                  id="duracao"
                  value={product.duracao || ""}
                  onChange={(e) => setProduct({ ...product, duracao: e.target.value })}
                  placeholder="Ex: 60-150 min"
                />
              </div>

              <div className="col-6 field mb-3">
                <label htmlFor="idade" className="font-bold mb-1 block">Idade Recomendada</label>
                <InputText
                  id="idade"
                  value={product.idadeRecomendada || ""}
                  onChange={(e) => setProduct({ ...product, idadeRecomendada: e.target.value })}
                  placeholder="Ex: 14+"
                />
              </div>
            </div>

            <div className="field mb-3">
              <label htmlFor="mechanics" className="font-bold mb-1 block">Mecânicas</label>
              <InputText
                id="mechanics"
                value={product.mechanics || ""}
                onChange={(e) => setProduct({ ...product, mechanics: e.target.value })}
                placeholder="Ex: Controle de área, Draft"
              />
            </div>

            <Divider className="my-3" />

            {/* Imagem Principal */}
            <div className="field mb-3">
              <label className="font-bold mb-2 block">Imagem Principal *</label>
              <div className="flex gap-3 align-items-center">
                <div className="flex-grow-1 border-1 border-300 border-round p-2 bg-gray-50 flex align-items-center justify-content-center relative" style={{ height: "90px" }}>
                  {product.imageUrl ? (
                    <img src={`${API_BASE_URL}${product.imageUrl}`} alt="Capa" style={{ maxHeight: "80px", objectFit: "contain" }} />
                  ) : (
                    <span className="text-500 text-xs">Sem imagem selecionada</span>
                  )}
                  {uploadingMain && (
                    <div className="absolute inset-0 flex align-items-center justify-content-center bg-white opacity-80">
                      <i className="pi pi-spin pi-spinner text-xl"></i>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Button type="button" icon="pi pi-upload" label="Enviar" severity="secondary" className="p-button-outlined" onClick={() => document.getElementById("main-upload")?.click()} />
                  <input id="main-upload" type="file" onChange={handleMainImageChange} accept="image/*" className="hidden" />
                </div>
              </div>
              {submitted && !product.imageUrl && <small className="p-error block mt-1">Imagem principal é obrigatória.</small>}
            </div>

            {/* Galeria Secundária */}
            <div className="field mb-3">
              <div className="flex justify-content-between align-items-center mb-2">
                <label className="font-bold">Galeria Secundária (Mini-Galeria)</label>
                <Button type="button" icon="pi pi-plus" label="Adicionar Fotos" severity="secondary" className="p-button-text p-button-sm" onClick={() => document.getElementById("gallery-upload")?.click()} disabled={uploadingGallery} />
                <input id="gallery-upload" type="file" multiple onChange={handleGalleryImageChange} accept="image/*" className="hidden" />
              </div>

              <div className="flex flex-wrap gap-2 border-1 border-300 border-round p-3 bg-gray-50 overflow-y-auto" style={{ maxHeight: "150px", minHeight: "80px" }}>
                {uploadingGallery && (
                  <div className="w-full flex align-items-center justify-content-center py-2">
                    <i className="pi pi-spin pi-spinner mr-2"></i> Enviando imagens...
                  </div>
                )}
                {(!product.otherImages || product.otherImages.length === 0) && !uploadingGallery && (
                  <span className="text-500 text-xs italic m-auto">Nenhuma imagem na galeria secundária.</span>
                )}
                {product.otherImages?.map((url, index) => (
                  <div key={index} className="relative border-1 border-200 border-round overflow-hidden" style={{ width: "60px", height: "60px" }}>
                    <img src={`${API_BASE_URL}${url}`} alt="Galeria" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Button
                      type="button"
                      icon="pi pi-times"
                      rounded
                      severity="danger"
                      className="absolute p-button-sm flex align-items-center justify-content-center"
                      style={{ top: "2px", right: "2px", width: "1.2rem", height: "1.2rem", fontSize: "0.6rem" }}
                      onClick={() => removeGalleryImage(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Dialog>

      {/* Confirmar Exclusão */}
      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirmar Exclusão"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content flex align-items-center gap-3">
          <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: "2rem" }} />
          {product && (
            <span>
              Tem certeza que deseja excluir o produto <strong>{product.name}</strong>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
