import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";
import { SelectButton } from "primereact/selectbutton";
import { ProductDialog } from "./components/ProductDialog";
import { DeleteProductDialog } from "./components/DeleteProductDialog";
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
  category: { id: number; name?: string };
  promo: boolean;
  visible?: boolean;
  discountType?: "PERCENTAGE" | "VALUE";
  discountValue?: number;
  stock: number;
  mechanics?: string;
  players?: string;
  editor?: string;
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
  const [globalFilter, setGlobalFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");

  const emptyProduct: IProduct = {
    name: "",
    description: "",
    price: 0,
    promo: false,
    visible: true,
    discountType: "PERCENTAGE",
    discountValue: 0,
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

  const toggleVisibility = async (product: IProduct) => {
    try {
      const updatedProduct = { ...product, visible: product.visible === false ? true : false };
      const response = await ProductService.save(updatedProduct);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: `Produto ${updatedProduct.visible ? "ativado (visível)" : "inativado (oculto)"} com sucesso.`,
          life: 3000,
        });
        loadProducts();
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar a visibilidade do produto.",
          life: 3000,
        });
      }
    } catch (error) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Ocorreu um erro ao alterar a visibilidade.",
        life: 3000,
      });
    }
  };

  const actionBodyTemplate = (rowData: IProduct) => {
    const isVisible = rowData.visible !== false;
    return (
      <div className="flex gap-2">
        <Button
          icon={isVisible ? "pi pi-eye" : "pi pi-eye-slash"}
          rounded
          outlined
          severity={isVisible ? "secondary" : "warning"}
          className="p-button-sm"
          onClick={() => toggleVisibility(rowData)}
          tooltip={isVisible ? "Ocultar da Loja" : "Mostrar na Loja"}
          tooltipOptions={{ position: "top" }}
        />
        <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => editProduct(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDeleteProduct(rowData)} />
      </div>
    );
  };

  const renderHeader = () => {
    const filterOptions = [
      { label: "Todos", value: "ALL" },
      { label: "Ativos", value: "ACTIVE" },
      { label: "Inativos", value: "INACTIVE" }
    ];

    return (
      <div className="flex justify-content-between align-items-center flex-wrap gap-2">
        <span className="text-xl font-bold text-800">Produtos</span>
        <div className="flex align-items-center flex-wrap gap-2">
          <SelectButton
            value={visibilityFilter}
            options={filterOptions}
            onChange={(e) => setVisibilityFilter(e.value || "ALL")}
            className="p-button-sm"
          />
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Pesquisar produto..."
              className="p-inputtext-sm w-full sm:w-15rem"
            />
          </IconField>
        </div>
      </div>
    );
  };

  const header = renderHeader();

  const filteredProducts = products.filter(p => {
    if (visibilityFilter === "ACTIVE") return p.visible !== false;
    if (visibilityFilter === "INACTIVE") return p.visible === false;
    return true;
  });

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
          value={filteredProducts}
          loading={loading}
          paginator
          rows={10}
          globalFilter={globalFilter}
          header={header}
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
      <ProductDialog
        visible={productDialog}
        product={product}
        submitted={submitted}
        categories={categories}
        uploadingMain={uploadingMain}
        uploadingGallery={uploadingGallery}
        onHide={hideDialog}
        onSave={saveProduct}
        setProduct={setProduct}
        handleMainImageChange={handleMainImageChange}
        handleGalleryImageChange={handleGalleryImageChange}
        removeGalleryImage={removeGalleryImage}
      />

      {/* Confirmar Exclusão */}
      <DeleteProductDialog
        visible={deleteDialog}
        productName={product.name}
        onHide={hideDeleteDialog}
        onConfirm={deleteProduct}
      />
    </div>
  );
}
