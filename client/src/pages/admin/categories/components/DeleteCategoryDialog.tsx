import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

// Props do componente DeleteCategoryDialog
interface DeleteCategoryDialogProps {
  visible: boolean;
  categoryName: string;
  onHide: () => void;
  onConfirm: () => void;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  visible,
  categoryName,
  onHide,
  onConfirm
}) => {
  // Rodapé do diálogo de exclusão
  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Não" icon="pi pi-times" outlined onClick={onHide} />
      <Button label="Sim, Excluir" icon="pi pi-check" severity="danger" onClick={onConfirm} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header="Confirmar Exclusão"
      modal
      footer={deleteDialogFooter}
      onHide={onHide}
    >
      <div className="confirmation-content flex align-items-center gap-3">
        <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: "2rem" }} />
        <span>
          Tem certeza que deseja excluir a categoria <strong>{categoryName}</strong>?
        </span>
      </div>
    </Dialog>
  );
};
