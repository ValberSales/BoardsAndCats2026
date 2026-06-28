import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import type { IAdminAttachment } from "@/services/admin-service";

// Props do componente OrderDocumentsCard
interface OrderDocumentsCardProps {
  attachments?: IAdminAttachment[];
  previewLoadingId: string | null;
  onGenericFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: (docId: string, fileName: string) => void;
  onDownload: (attachment: IAdminAttachment) => void;
}

export const OrderDocumentsCard: React.FC<OrderDocumentsCardProps> = ({
  attachments = [],
  previewLoadingId,
  onGenericFileUpload,
  onPreview,
  onDownload
}) => {
  return (
    <Card className="shadow-2" title="Documentos Anexos">
      <div className="flex flex-column gap-4">
        {/* Área de Upload Genérica */}
        <div className="flex flex-column align-items-center justify-content-center p-4 border-2 border-dashed border-300 border-round hover:border-primary transition-duration-200 cursor-pointer relative">
          <i className="pi pi-upload text-3xl text-400 mb-2"></i>
          <span className="text-600 font-semibold text-xs text-center">
            Clique para anexar um documento<br />(PDF da Nota Fiscal, Comprovantes, etc.)
          </span>
          <input
            type="file"
            onChange={onGenericFileUpload}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
        </div>

        {/* Lista de Arquivos Anexados */}
        <div>
          <h4 className="text-sm font-bold text-900 m-0 mb-3 uppercase tracking-wider text-500">
            Arquivos do Pedido ({attachments.length})
          </h4>
          
          {attachments.length === 0 ? (
            <div className="text-center text-500 text-sm py-4 border-round bg-gray-50">
              Nenhum documento anexado.
            </div>
          ) : (
            <div className="flex flex-column gap-2">
              {attachments.map((file) => {
                const isInvoice = file.name.toLowerCase().includes("nota_fiscal") || file.name.toLowerCase().includes("invoice");
                const docIdStr = String(file.id);
                return (
                  <div
                    key={file.id}
                    className="flex align-items-center justify-content-between p-3 surface-100 border-round border-left-3 border-primary"
                  >
                    <div className="flex align-items-center gap-2 overflow-hidden mr-2">
                      <i className={`pi ${isInvoice ? "pi-file-pdf text-red-500 text-xl" : "pi-file text-700 text-xl"}`}></i>
                      <div className="flex flex-column overflow-hidden">
                        <span className="text-xs font-bold text-900 truncate" title={file.name}>
                          {file.name.replace(/^Nota_Fiscal_/, "")}
                        </span>
                        <span className="text-500 text-xxs mt-0.5">Enviado em {file.uploadedAt}</span>
                      </div>
                    </div>
                    {/* Botões de Visualizar e Baixar */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        icon="pi pi-eye"
                        className="p-button-text p-button-rounded p-button-sm text-primary"
                        onClick={() => onPreview(docIdStr, file.name)}
                        tooltip="Visualizar"
                        tooltipOptions={{ position: "top" }}
                        loading={previewLoadingId === docIdStr}
                      />
                      <Button
                        icon="pi pi-download"
                        className="p-button-text p-button-rounded p-button-sm text-primary"
                        onClick={() => onDownload(file)}
                        tooltip="Baixar"
                        tooltipOptions={{ position: "top" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
