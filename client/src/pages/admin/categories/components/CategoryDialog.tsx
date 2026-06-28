import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { CategoryIcon } from "@/components/common/category-icon";

// Interface para a Categoria
interface ICategory {
  id?: number;
  name: string;
  icon?: string;
}

// Props do componente CategoryDialog
interface CategoryDialogProps {
  visible: boolean;
  category: ICategory;
  submitted: boolean;
  onHide: () => void;
  onSave: () => void;
  setCategory: React.Dispatch<React.SetStateAction<ICategory>>;
  toastRef: React.RefObject<Toast | null>;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  visible,
  category,
  submitted,
  onHide,
  onSave,
  setCategory,
  toastRef
}) => {
  // Trata o upload do arquivo SVG
  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação do tipo do arquivo
      if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Apenas arquivos SVG são permitidos.",
          life: 3000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Valida se o conteúdo do arquivo possui a tag <svg
        if (text.includes("<svg")) {
          setCategory(prev => ({ ...prev, icon: text }));
        } else {
          toastRef.current?.show({
            severity: "error",
            summary: "Erro",
            detail: "O arquivo selecionado não parece ser um SVG válido.",
            life: 3000
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Rodapé com os botões de ação do diálogo
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
      <Button label="Salvar" icon="pi pi-check" onClick={onSave} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header={category.id ? "Editar Categoria" : "Nova Categoria"}
      modal
      className="p-fluid"
      footer={dialogFooter}
      onHide={onHide}
    >
      {/* Campo para o Nome da Categoria */}
      <div className="field mb-3">
        <label htmlFor="name" className="font-bold mb-2 block">Nome da Categoria *</label>
        <InputText
          id="name"
          value={category.name}
          onChange={(e) => setCategory(prev => ({ ...prev, name: e.target.value }))}
          required
          autoFocus
          className={submitted && !category.name ? "p-invalid" : ""}
        />
        {submitted && !category.name && (
          <small className="p-error block mt-1">Nome é obrigatório.</small>
        )}
      </div>

      {/* Campo para Upload do Ícone SVG */}
      <div className="field mb-3">
        <label htmlFor="icon" className="font-bold mb-2 block">Ícone SVG *</label>
        <input
          id="icon-upload"
          type="file"
          accept=".svg"
          onChange={handleSvgUpload}
          style={{ display: 'none' }}
        />
        
        {category.icon ? (
          <div className="flex flex-column gap-3 p-3 border-1 surface-border border-round surface-50">
            <div className="flex align-items-center justify-content-between">
              <span className="text-sm font-semibold text-700 flex align-items-center gap-2">
                <i className="pi pi-image text-primary"></i> Pré-visualização do Ícone
              </span>
              <span className="text-xs text-green-600 font-semibold flex align-items-center gap-1 bg-green-50 px-2 py-1 border-round">
                <i className="pi pi-check-circle"></i> Ativo
              </span>
            </div>
            <div className="flex align-items-center justify-content-center p-4 checkerboard-bg border-round border-1 surface-border" style={{ height: "100px" }}>
              <CategoryIcon iconHtml={category.icon} size={64} className="text-800" />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                label="Substituir Ícone SVG"
                icon="pi pi-sync"
                className="p-button-outlined p-button-sm flex-1"
                onClick={() => document.getElementById("icon-upload")?.click()}
              />
            </div>
          </div>
        ) : (
          <div>
            <div 
              className="flex flex-column align-items-center justify-content-center p-5 border-2 border-dashed surface-border border-round hover:border-primary cursor-pointer transition-colors duration-200"
              onClick={() => document.getElementById("icon-upload")?.click()}
            >
              <i className="pi pi-cloud-upload text-4xl text-400 mb-3" />
              <span className="font-semibold text-900 mb-1">Selecionar arquivo SVG</span>
              <span className="text-xs text-500">Apenas arquivos no formato .svg são suportados</span>
            </div>
            {submitted && !category.icon && (
              <small className="p-error block mt-1">O ícone SVG é obrigatório.</small>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
