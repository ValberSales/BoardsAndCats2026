import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { BreadCrumb } from "primereact/breadcrumb";
import { API_BASE_URL } from "@/lib/axios";
import CarouselService from "@/services/carousel-service";
import ProductService from "@/services/product-service";
import MediaService from "@/services/media-service";

interface ICarouselItem {
  id?: number;
  productId?: number;
  imageUrl: string;
  alt: string;
}

interface IProduct {
  id?: number;
  name: string;
}

export function AdminCarouselPage() {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);

  const [banners, setBanners] = useState<ICarouselItem[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerDialog, setBannerDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [banner, setBanner] = useState<ICarouselItem>({ imageUrl: "", alt: "" });
  const [submitted, setSubmitted] = useState(false);
  
  // Image Upload & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Carrossel de Destaques" }
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  useEffect(() => {
    loadBanners();
    loadProducts();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const response = await CarouselService.findAll();
    if (response.success && Array.isArray(response.data)) {
      setBanners(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao buscar banners.",
        life: 3000
      });
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    const response = await ProductService.findAll();
    if (response.success && Array.isArray(response.data)) {
      setProducts(response.data);
    }
  };

  const openNew = () => {
    if (banners.length >= 6) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Limite Atingido",
        detail: "O limite máximo é de 6 banners no carrossel.",
        life: 3000
      });
      return;
    }
    setBanner({ imageUrl: "", alt: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setSubmitted(false);
    setBannerDialog(true);
  };

  const hideDialog = () => {
    setBannerDialog(false);
    setSubmitted(false);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const saveBanner = async () => {
    setSubmitted(true);

    // Validate image presence
    if (!previewUrl && !selectedFile) {
      return;
    }

    // Validate alt text
    if (!banner.alt.trim()) {
      return;
    }

    // Limit check for new banners
    if (!banner.id && banners.length >= 6) {
      toastRef.current?.show({
        severity: "error",
        summary: "Limite Atingido",
        detail: "O limite máximo é de 6 banners no carrossel.",
        life: 3000
      });
      return;
    }

    let finalImageUrl = banner.imageUrl;
    setUploadingImage(true);

    try {
      // If a new file is selected, upload it first
      if (selectedFile) {
        const filename = await MediaService.upload(selectedFile);
        finalImageUrl = `/media/${filename}`;
      }

      const bannerToSave = { ...banner, imageUrl: finalImageUrl };
      const response = await CarouselService.save(bannerToSave);

      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: banner.id ? "Banner atualizado com sucesso!" : "Banner criado com sucesso!",
          life: 3000
        });
        loadBanners();
        setBannerDialog(false);
        setBanner({ imageUrl: "", alt: "" });
        setSelectedFile(null);
        setPreviewUrl("");
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: response.message || "Erro ao salvar banner.",
          life: 3000
        });
      }
    } catch (err) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro Upload",
        detail: "Falha ao enviar arquivo ou salvar o banner.",
        life: 3000
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const editBanner = (item: ICarouselItem) => {
    setBanner({ ...item });
    setSelectedFile(null);
    setPreviewUrl(item.imageUrl);
    setBannerDialog(true);
  };

  const confirmDeleteBanner = (item: ICarouselItem) => {
    setBanner(item);
    setDeleteDialog(true);
  };

  const deleteBanner = async () => {
    if (banner.id) {
      const response = await CarouselService.remove(banner.id);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Banner excluído com sucesso!",
          life: 3000
        });
        loadBanners();
        setDeleteDialog(false);
        setBanner({ imageUrl: "", alt: "" });
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao excluir banner.",
          life: 3000
        });
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const imageBodyTemplate = (rowData: ICarouselItem) => {
    return (
      <img
        src={`${API_BASE_URL}${rowData.imageUrl}`}
        alt={rowData.alt}
        className="shadow-2 border-round"
        style={{ width: "160px", height: "65px", objectFit: "cover" }}
      />
    );
  };

  const productBodyTemplate = (rowData: ICarouselItem) => {
    if (!rowData.productId) return <span className="text-500 font-semibold italic text-xs">Nenhum</span>;
    const prod = products.find((p) => p.id === rowData.productId);
    return prod ? <span>{prod.name} (ID #{prod.id})</span> : <span>Produto #{rowData.productId}</span>;
  };

  const actionBodyTemplate = (rowData: ICarouselItem) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="p-button-sm"
          onClick={() => editBanner(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          className="p-button-sm"
          onClick={() => confirmDeleteBanner(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" onClick={saveBanner} loading={uploadingImage} disabled={uploadingImage} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
      <Button label="Sim, Excluir" icon="pi pi-check" severity="danger" onClick={deleteBanner} />
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-5 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0">Carrossel de Destaques</h1>
          <p className="text-600 m-0 mt-1">Configure os banners do carrossel rotativo na página principal (máximo de 6 banners).</p>
        </div>
        <div className="flex gap-2">
          <Button label="Voltar ao Painel" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => navigate("/admin/dashboard")} />
          <Button 
            label="Novo Banner" 
            icon="pi pi-plus" 
            onClick={openNew} 
            disabled={banners.length >= 6} 
            tooltip={banners.length >= 6 ? "Limite de 6 banners atingido" : undefined}
            tooltipOptions={{ position: "bottom" }}
          />
        </div>
      </div>

      <div className="surface-card shadow-2 border-round p-4">
        <DataTable
          value={banners}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhum banner cadastrado."
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" sortable style={{ width: "10%" }} />
          <Column header="Visualização" body={imageBodyTemplate} style={{ width: "30%" }} />
          <Column field="alt" header="Texto Alternativo" sortable style={{ width: "30%" }} />
          <Column header="Link para Produto" body={productBodyTemplate} style={{ width: "20%" }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ width: "10%" }} />
        </DataTable>
      </div>

      {/* Dialogo Banner */}
      <Dialog
        visible={bannerDialog}
        style={{ width: "500px" }}
        header={banner.id ? "Editar Banner" : "Novo Banner"}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        {/* Upload de Imagem */}
        <div className="field mb-4">
          <label className="font-bold mb-2 block">Imagem do Banner (1200x400 recomendado) *</label>
          <div className="flex flex-column align-items-center justify-content-center p-4 border-2 border-dashed border-300 border-round hover:border-primary transition-duration-200 cursor-pointer relative" style={{ minHeight: "150px" }}>
            {previewUrl ? (
              <img
                src={previewUrl.startsWith("blob:") ? previewUrl : `${API_BASE_URL}${previewUrl}`}
                alt="Prévia do Banner"
                style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
              />
            ) : (
              <div className="text-center">
                <i className={`pi ${uploadingImage ? "pi-spin pi-spinner" : "pi-upload"} text-3xl text-400 mb-2`}></i>
                <span className="text-600 font-semibold text-xs block">
                  {uploadingImage ? "Enviando arquivo..." : "Clique para selecionar ou arrastar imagem"}
                </span>
              </div>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              accept=".png,.jpg,.jpeg,.webp"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
          </div>
          {submitted && !previewUrl && (
            <small className="p-error block mt-1">É obrigatório selecionar uma imagem.</small>
          )}
        </div>

        {/* Alt Text */}
        <div className="field mb-4">
          <label htmlFor="alt" className="font-bold mb-2 block">Texto Alternativo / Descrição *</label>
          <InputText
            id="alt"
            value={banner.alt}
            onChange={(e) => setBanner({ ...banner, alt: e.target.value })}
            placeholder="Ex: Gloomhaven - Aventura Épica"
            required
            className={submitted && !banner.alt ? "p-invalid" : ""}
          />
          {submitted && !banner.alt && (
            <small className="p-error block mt-1">Texto alternativo é obrigatório.</small>
          )}
        </div>

        {/* Vincular Produto */}
        <div className="field mb-3">
          <label htmlFor="product" className="font-bold mb-2 block">Vincular a Produto (Opcional)</label>
          <Dropdown
            id="product"
            value={banner.productId}
            options={products}
            optionValue="id"
            optionLabel="name"
            onChange={(e) => setBanner({ ...banner, productId: e.value })}
            placeholder="Selecionar Produto para Redirecionamento"
            showClear
          />
        </div>
      </Dialog>

      {/* Confirmar exclusão */}
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
          {banner && (
            <span>
              Tem certeza que deseja excluir este banner do carrossel?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
