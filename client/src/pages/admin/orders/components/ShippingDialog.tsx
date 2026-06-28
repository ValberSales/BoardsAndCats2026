import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

// Props do componente ShippingDialog
interface ShippingDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: (trackingCode: string, invoiceFile: File | null) => void;
  initialTrackingCode?: string;
  hasExistingInvoice: boolean;
}

export const ShippingDialog: React.FC<ShippingDialogProps> = ({
  visible,
  onHide,
  onConfirm,
  initialTrackingCode = "",
  hasExistingInvoice
}) => {
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Sincroniza o código de rastreamento inicial quando o diálogo abre
  useEffect(() => {
    if (visible) {
      setTrackingCode(initialTrackingCode);
      setInvoiceFile(null);
      setError("");
    }
  }, [visible, initialTrackingCode]);

  // Valida e confirma os dados de envio
  const handleConfirm = () => {
    setError("");

    if (!trackingCode.trim()) {
      setError("Código de rastreamento é obrigatório.");
      return;
    }

    if (!invoiceFile && !hasExistingInvoice) {
      setError("A Nota Fiscal em PDF é obrigatória para marcar o pedido como Enviado.");
      return;
    }

    onConfirm(trackingCode, invoiceFile);
  };

  // Rodapé do diálogo com botões de ação
  const dialogFooter = (
    <div className="flex justify-content-end gap-2 mt-3">
      <Button label="Cancelar" className="p-button-text" onClick={onHide} />
      <Button label="Confirmar Envio" icon="pi pi-check" onClick={handleConfirm} />
    </div>
  );

  return (
    <Dialog
      header="Detalhes de Envio do Pedido"
      visible={visible}
      style={{ width: "90vw", maxWidth: "500px" }}
      onHide={onHide}
      footer={dialogFooter}
    >
      <div className="flex flex-column gap-4 py-2">
        <p className="m-0 text-700 text-sm">
          Para atualizar o status para <strong>ENVIADO (SHIPPED)</strong>, é obrigatório inserir o código de rastreamento e anexar o PDF da Nota Fiscal.
        </p>

        {/* Campo do Código de Rastreamento */}
        <div>
          <label htmlFor="tracking-input" className="block text-900 font-semibold text-sm mb-2">
            Código de Rastreamento *
          </label>
          <InputText
            id="tracking-input"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Ex: BR123456789BR"
            className="w-full"
          />
        </div>

        {/* Campo do Upload de PDF da Nota Fiscal */}
        <div>
          <label className="block text-900 font-semibold text-sm mb-2">
            Anexar Nota Fiscal (PDF) *
          </label>
          <div className="flex align-items-center gap-3">
            <Button
              type="button"
              icon="pi pi-file-pdf"
              label={invoiceFile ? "Nota Fiscal Selecionada" : "Selecionar PDF"}
              className={invoiceFile ? "p-button-success" : "p-button-outlined"}
              onClick={() => document.getElementById("invoice-upload-input")?.click()}
            />
            <span className="text-xs text-600 truncate max-w-15rem">
              {invoiceFile ? invoiceFile.name : "Nenhum arquivo selecionado"}
            </span>
          </div>
          <input
            id="invoice-upload-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Exibição de Mensagem de Erro */}
        {error && (
          <div className="p-message p-message-error text-xs p-2 border-round">
            <i className="pi pi-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}
      </div>
    </Dialog>
  );
};
