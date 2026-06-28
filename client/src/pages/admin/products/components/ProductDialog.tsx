import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { SelectButton } from "primereact/selectbutton";
import { Divider } from "primereact/divider";
import { API_BASE_URL } from "@/lib/axios";

// Interfaces para o Produto e Categoria
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
  visible?: boolean;
  discountType?: "PERCENTAGE" | "VALUE";
  discountValue?: number;
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

// Props do componente ProductDialog
interface ProductDialogProps {
  visible: boolean;
  product: IProduct;
  submitted: boolean;
  categories: ICategory[];
  uploadingMain: boolean;
  uploadingGallery: boolean;
  onHide: () => void;
  onSave: () => void;
  setProduct: React.Dispatch<React.SetStateAction<IProduct>>;
  handleMainImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGalleryImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeGalleryImage: (index: number) => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  visible,
  product,
  submitted,
  categories,
  uploadingMain,
  uploadingGallery,
  onHide,
  onSave,
  setProduct,
  handleMainImageChange,
  handleGalleryImageChange,
  removeGalleryImage
}) => {
  // Rodapé do diálogo com botões de ação
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
      <Button label="Salvar" icon="pi pi-check" onClick={onSave} disabled={uploadingMain || uploadingGallery} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "800px" }}
      header={product.id ? "Editar Produto" : "Novo Produto"}
      modal
      className="p-fluid"
      footer={dialogFooter}
      onHide={onHide}
    >
      <div className="grid">
        {/* Informações Gerais */}
        <div className="col-12 md:col-6 p-2">
          <h3 className="text-lg font-bold mb-3">Informações Gerais</h3>
          
          {/* Nome do Produto */}
          <div className="field mb-3">
            <label htmlFor="prod-name" className="font-bold mb-1 block">Nome do Produto *</label>
            <InputText
              id="prod-name"
              value={product.name}
              onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
              required
              className={submitted && !product.name ? "p-invalid" : ""}
            />
            {submitted && !product.name && <small className="p-error block mt-1">Nome é obrigatório.</small>}
          </div>

          {/* Descrição */}
          <div className="field mb-3">
            <label htmlFor="description" className="font-bold mb-1 block">Descrição</label>
            <InputTextarea
              id="description"
              value={product.description}
              onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              autoResize
            />
          </div>

          <div className="grid">
            {/* Preço */}
            <div className="col-6 field mb-3">
              <label htmlFor="price" className="font-bold mb-1 block">Preço (R$) *</label>
              <InputNumber
                id="price"
                value={product.price}
                onValueChange={(e) => setProduct(prev => ({ ...prev, price: e.value || 0 }))}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                className={submitted && product.price <= 0 ? "p-invalid" : ""}
              />
              {submitted && product.price <= 0 && <small className="p-error block mt-1">Preço deve ser maior que zero.</small>}
            </div>

            {/* Estoque */}
            <div className="col-6 field mb-3">
              <label htmlFor="stock" className="font-bold mb-1 block">Estoque *</label>
              <InputNumber
                id="stock"
                value={product.stock}
                onValueChange={(e) => setProduct(prev => ({ ...prev, stock: e.value || 0 }))}
                min={0}
              />
            </div>
          </div>

          <div className="grid align-items-center">
            {/* Categoria */}
            <div className="col-6 field mb-3">
              <label htmlFor="category" className="font-bold mb-1 block">Categoria *</label>
              <Dropdown
                id="category"
                value={product.category.id}
                options={categories}
                optionValue="id"
                optionLabel="name"
                onChange={(e) => setProduct(prev => ({ ...prev, category: { id: e.value } }))}
              />
            </div>

            {/* Oferta / Promoção */}
            <div className="col-6 field mb-3 flex align-items-center justify-content-between pt-4">
              <span className="font-bold">Colocar em Oferta?</span>
              <InputSwitch
                checked={product.promo}
                onChange={(e) => setProduct(prev => ({ ...prev, promo: e.value }))}
              />
            </div>
          </div>

          {product.promo && (
            <div className="grid border-1 border-300 border-round p-3 bg-gray-50 mb-3 mx-1">
              {/* Tipo de Desconto */}
              <div className="col-12 sm:col-6 field mb-2 sm:mb-0">
                <label className="font-bold mb-2 block text-sm">Tipo de Desconto</label>
                <SelectButton
                  value={product.discountType || "PERCENTAGE"}
                  options={[
                    { label: "%", value: "PERCENTAGE" },
                    { label: "R$", value: "VALUE" }
                  ]}
                  onChange={(e) => setProduct(prev => ({ ...prev, discountType: e.value || "PERCENTAGE" }))}
                  className="w-full text-center"
                />
              </div>

              {/* Valor do Desconto */}
              <div className="col-12 sm:col-6 field mb-0">
                <label htmlFor="discount-val" className="font-bold mb-2 block text-sm">Valor do Desconto</label>
                <InputNumber
                  id="discount-val"
                  value={product.discountValue}
                  onValueChange={(e) => setProduct(prev => ({ ...prev, discountValue: e.value || 0 }))}
                  mode={product.discountType === "VALUE" ? "currency" : "decimal"}
                  currency="BRL"
                  locale="pt-BR"
                  min={0}
                  max={product.discountType === "PERCENTAGE" ? 100 : product.price}
                  suffix={product.discountType === "PERCENTAGE" ? "%" : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Ficha Técnica e Imagens */}
        <div className="col-12 md:col-6 p-2 border-left-none md:border-left-1 border-200">
          <h3 className="text-lg font-bold mb-3">Ficha Técnica & Mídias</h3>

          <div className="grid">
            {/* Quantidade de Jogadores */}
            <div className="col-6 field mb-3">
              <label htmlFor="players" className="font-bold mb-1 block">Jogadores</label>
              <InputText
                id="players"
                value={product.players || ""}
                onChange={(e) => setProduct(prev => ({ ...prev, players: e.target.value }))}
                placeholder="Ex: 2-5"
              />
            </div>

            {/* Editora */}
            <div className="col-6 field mb-3">
              <label htmlFor="editor" className="font-bold mb-1 block">Editora</label>
              <InputText
                id="editor"
                value={product.editor || ""}
                onChange={(e) => setProduct(prev => ({ ...prev, editor: e.target.value }))}
                placeholder="Ex: Feuerland"
              />
            </div>
          </div>

          <div className="grid">
            {/* Duração da Partida */}
            <div className="col-6 field mb-3">
              <label htmlFor="duracao" className="font-bold mb-1 block">Duração</label>
              <InputText
                id="duracao"
                value={product.duracao || ""}
                onChange={(e) => setProduct(prev => ({ ...prev, duracao: e.target.value }))}
                placeholder="Ex: 60-150 min"
              />
            </div>

            {/* Idade Recomendada */}
            <div className="col-6 field mb-3">
              <label htmlFor="idade" className="font-bold mb-1 block">Idade Recomendada</label>
              <InputText
                id="idade"
                value={product.idadeRecomendada || ""}
                onChange={(e) => setProduct(prev => ({ ...prev, idadeRecomendada: e.target.value }))}
                placeholder="Ex: 14+"
              />
            </div>
          </div>

          {/* Mecânicas */}
          <div className="field mb-3">
            <label htmlFor="mechanics" className="font-bold mb-1 block">Mecânicas</label>
            <InputText
              id="mechanics"
              value={product.mechanics || ""}
              onChange={(e) => setProduct(prev => ({ ...prev, mechanics: e.target.value }))}
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
  );
};
