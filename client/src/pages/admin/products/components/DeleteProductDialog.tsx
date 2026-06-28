import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

// Props do componente DeleteProductDialog
interface DeleteProductDialogProps {
  visible: boolean;
  productName: string;
  onHide: () => void;
  onConfirm: () => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  visible,
  productName,
  onHide,
  onConfirm
}) => {
  // Rodapé do diálogo de confirmação
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
          Tem certeza que deseja excluir o produto <strong>{productName}</strong>?
        </span>
      </div>
    </Dialog>
  );
};
