import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

// Props do componente PreviewDocDialog
interface PreviewDocDialogProps {
  visible: boolean;
  onHide: () => void;
  previewDoc: { url: string; name: string; type: string } | null;
}

export const PreviewDocDialog: React.FC<PreviewDocDialogProps> = ({
  visible,
  onHide,
  previewDoc
}) => {
  // Trata o download do arquivo em pré-visualização
  const handleDownload = () => {
    if (!previewDoc) return;
    const link = document.createElement("a");
    link.href = previewDoc.url;
    link.setAttribute("download", previewDoc.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Rodapé do diálogo de visualização
  const dialogFooter = (
    <div className="flex justify-content-end gap-2 mt-3">
      <Button label="Fechar" className="p-button-text" onClick={onHide} />
      {previewDoc && (
        <Button label="Baixar Arquivo" icon="pi pi-download" onClick={handleDownload} />
      )}
    </div>
  );

  return (
    <Dialog
      header={previewDoc?.name.replace(/^Nota_Fiscal_/, "") || "Visualizar Documento"}
      visible={visible}
      style={{ width: "90vw", maxWidth: "800px" }}
      onHide={onHide}
      footer={dialogFooter}
    >
      {previewDoc && (
        <div className="flex justify-content-center align-items-center bg-gray-50 border-round p-3 overflow-auto" style={{ minHeight: "350px" }}>
          {/* Se for Imagem */}
          {previewDoc.type.startsWith("image/") ? (
            <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-30rem border-round shadow-2" />
          ) : /* Se for PDF */
          previewDoc.type === "application/pdf" ? (
            <iframe src={previewDoc.url} title={previewDoc.name} className="w-full border-round shadow-2" style={{ height: "450px", border: "none" }}></iframe>
          ) : /* Formato não suportado para visualização em tela */ (
            <div className="text-center text-600 p-4">
              <i className="pi pi-file text-5xl mb-3 block opacity-50"></i>
              <span>Visualização indisponível para este formato. Utilize o botão de download para salvar o arquivo.</span>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
