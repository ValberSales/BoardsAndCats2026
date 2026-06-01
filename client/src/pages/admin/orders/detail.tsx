import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import AdminService from "@/services/admin-service";
import type { IAdminOrder, IAdminAttachment } from "@/services/admin-service";
import { api } from "@/lib/axios";

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);
  
  const [order, setOrder] = useState<IAdminOrder | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // State para visualização de documentos
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  // Modal de Envio (SHIPPED)
  const [shippingDialogVisible, setShippingDialogVisible] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState("");

  const orderId = Number(id);

  const handlePreview = async (docId: string, fileName: string) => {
    setPreviewLoadingId(docId);
    try {
      const response = await api.get(`/admin/orders/documents/${docId}/download`, {
        responseType: "blob",
      });
      const objectUrl = window.URL.createObjectURL(response.data);
      setPreviewDoc({ url: objectUrl, name: fileName, type: response.data.type || "application/pdf" });
    } catch (e) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao carregar pré-visualização.",
        life: 3000,
      });
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Pedidos", url: "/admin/orders" },
    { label: `Detalhes do Pedido #${id}` },
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  const loadOrder = async (orderId: number) => {
    setLoading(true);
    const response = await AdminService.getOrderById(orderId);
    if (response.success && response.data) {
      setOrder(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Pedido não encontrado.",
        life: 3000,
      });
      setTimeout(() => navigate("/admin/orders"), 1500);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isNaN(orderId)) {
      navigate("/admin/orders");
      return;
    }
    loadOrder(orderId);
  }, [orderId, navigate]);

  // Seletor de Status
  const statusOptions = [
    { label: "Pendente (PENDING)", value: "PENDING" },
    { label: "Pago (PAID)", value: "PAID" },
    { label: "Enviado (SHIPPED)", value: "SHIPPED" },
    { label: "Entregue (DELIVERED)", value: "DELIVERED" },
    { label: "Cancelado (CANCELED)", value: "CANCELED" },
  ];

  const handleStatusChange = async (newStatus: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED") => {
    if (!order) return;

    if (newStatus === "SHIPPED") {
      // Abre o diálogo de envio para obter o código e a nota fiscal
      setTrackingCode(order.trackingCode || "");
      setInvoiceFile(null);
      setInvoiceError("");
      setShippingDialogVisible(true);
    } else {
      // Atualização direta
      const response = await AdminService.updateOrderStatus(order.id, newStatus);
      if (response.success && response.data) {
        setOrder(response.data);
        toastRef.current?.show({
          severity: "success",
          summary: "Status Atualizado",
          detail: `O pedido #${order.id} agora está ${newStatus}.`,
          life: 3000,
        });
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível atualizar o status do pedido.",
          life: 3000,
        });
      }
    }
  };

  // Confirmar Envio com Anexo de Nota Fiscal
  const handleConfirmShipping = async () => {
    if (!order) return;
    setInvoiceError("");

    if (!trackingCode.trim()) {
      setInvoiceError("Código de rastreamento é obrigatório.");
      return;
    }

    const hasExistingInvoice = order.attachments?.some(a => a.name.toLowerCase().includes("nota_fiscal") || a.name.toLowerCase().includes("invoice"));
    if (!invoiceFile && !hasExistingInvoice) {
      setInvoiceError("A Nota Fiscal em PDF é obrigatória para marcar o pedido como Enviado.");
      return;
    }

    try {
      if (invoiceFile) {
        // Upload do documento primeiro
        const docResponse = await AdminService.uploadOrderDocument(order.id, invoiceFile);
        if (!docResponse.success) {
          setInvoiceError("Falha ao anexar a Nota Fiscal no MinIO.");
          return;
        }
      }

      // Atualiza o status
      const response = await AdminService.updateOrderStatus(order.id, "SHIPPED", trackingCode);
      if (response.success && response.data) {
        setOrder(response.data);
        toastRef.current?.show({
          severity: "success",
          summary: "Pedido Enviado",
          detail: `Status alterado para Enviado com rastreamento: ${trackingCode}.`,
          life: 3000,
        });
        setShippingDialogVisible(false);
      } else {
        setInvoiceError("Falha ao atualizar o status do pedido.");
      }
    } catch (e) {
      setInvoiceError("Ocorreu um erro no processo de envio.");
    }
  };

  // Upload Genérico de Anexos
  const handleGenericFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    const response = await AdminService.uploadOrderDocument(order.id, file);
    if (response.success) {
      toastRef.current?.show({
        severity: "success",
        summary: "Documento Anexado",
        detail: `Arquivo "${file.name}" enviado com sucesso.`,
        life: 3000,
      });
      loadOrder(order.id);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao enviar documento.",
        life: 3000,
      });
    }
    // Limpar o input
    event.target.value = "";
  };

  const downloadAttachment = (attachment: IAdminAttachment) => {
    AdminService.downloadDocument(attachment.id, attachment.name);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "PENDING": return "warning";
      case "PAID": return "info";
      case "SHIPPED": return "help";
      case "DELIVERED": return "success";
      case "CANCELED": return "danger";
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "PENDENTE";
      case "PAID": return "PAGO";
      case "SHIPPED": return "ENVIADO";
      case "DELIVERED": return "ENTREGUE";
      case "CANCELED": return "CANCELADO";
      default: return status;
    }
  };

  if (loading || !order) {
    return <div className="text-center p-6"><i className="pi pi-spin pi-spinner text-3xl"></i></div>;
  }

  const formattedDate = () => {
    const [year, month, day] = order.date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getItemsSubtotal = () => {
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      {/* Header */}
      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-5 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0 flex align-items-center gap-3">
            Pedido #{order.id}
            <Tag value={getStatusLabel(order.status)} severity={getStatusSeverity(order.status) as any} className="px-3 py-1 font-bold" />
          </h1>
          <p className="text-600 m-0 mt-1">Realizado em {formattedDate()}</p>
        </div>
        <Button label="Voltar para Pedidos" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => navigate("/admin/orders")} />
      </div>

      <div className="grid">
        {/* Coluna Esquerda: Detalhes, Itens e Totais */}
        <div className="col-12 lg:col-8 p-2">
          {/* Informações do Cliente */}
          <Card className="shadow-2 mb-4" title="Informações do Cliente">
            <div className="grid text-sm">
              <div className="col-12 sm:col-6 mb-2">
                <span className="block text-500 font-semibold mb-1">Nome Completo</span>
                <span className="text-900 font-bold">{order.clientName}</span>
              </div>
              <div className="col-12 sm:col-6 mb-2">
                <span className="block text-500 font-semibold mb-1">CPF</span>
                <span className="text-900">{order.clientCpf}</span>
              </div>
              <div className="col-12 sm:col-6 mb-2">
                <span className="block text-500 font-semibold mb-1">E-mail</span>
                <span className="text-900">{order.clientEmail}</span>
              </div>
              <div className="col-12 sm:col-6 mb-2">
                <span className="block text-500 font-semibold mb-1">Telefone</span>
                <span className="text-900">{order.clientPhone}</span>
              </div>
            </div>
          </Card>

          {/* Endereço de Entrega */}
          <Card className="shadow-2 mb-4" title="Endereço de Entrega">
            <div className="text-sm leading-relaxed">
              <p className="m-0 font-bold text-900">
                {order.shippingAddress.street}, {order.shippingAddress.number}
              </p>
              <p className="m-0 text-700">
                Bairro: {order.shippingAddress.neighborhood}
              </p>
              <p className="m-0 text-700">
                {order.shippingAddress.city} - {order.shippingAddress.state}, CEP: {order.shippingAddress.zip}
              </p>
            </div>
          </Card>

          {/* Itens do Pedido */}
          <Card className="shadow-2 mb-4" title="Itens do Pedido">
            <DataTable value={order.items} className="p-datatable-sm" responsiveLayout="scroll">
              <Column field="productName" header="Produto" style={{ fontWeight: "bold" }} />
              <Column field="unitPrice" header="Preço Unitário" body={(row) => formatCurrency(row.unitPrice)} />
              <Column field="quantity" header="Qtd" style={{ textAlign: "center" }} />
              <Column field="subtotal" header="Subtotal" body={(row) => formatCurrency(row.subtotal)} style={{ textAlign: "right" }} />
            </DataTable>
          </Card>

          {/* Totais do Pedido */}
          <Card className="shadow-2" title="Resumo de Valores">
            <div className="flex flex-column gap-2 text-sm">
              <div className="flex justify-content-between">
                <span className="text-600">Subtotal dos Itens:</span>
                <span className="text-900 font-semibold">{formatCurrency(getItemsSubtotal())}</span>
              </div>
              <div className="flex justify-content-between">
                <span className="text-600">Frete:</span>
                <span className="text-900 font-semibold">{formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-content-between text-red-600 font-semibold">
                  <span>Desconto Aplicado:</span>
                  <span>- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <hr className="border-top-1 border-300 my-2" />
              <div className="flex justify-content-between text-lg font-bold">
                <span className="text-900">Total Geral:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Controle Administrativo e Anexos */}
        <div className="col-12 lg:col-4 p-2">
          {/* Status e Pagamento */}
          <Card className="shadow-2 mb-4" title="Controle do Pedido">
            <div className="flex flex-column gap-4">
              <div>
                <span className="block text-500 font-semibold text-sm mb-2">Forma de Pagamento</span>
                <span className="text-900 font-semibold flex align-items-center gap-2">
                  <i className="pi pi-credit-card text-primary"></i> {order.paymentMethod}
                </span>
              </div>

              {order.trackingCode && (
                <div>
                  <span className="block text-500 font-semibold text-sm mb-2">Código de Rastreio</span>
                  <span className="text-900 font-bold bg-gray-100 px-3 py-1 border-round border-1 border-300 text-sm">
                    {order.trackingCode}
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="status-select" className="block text-500 font-semibold text-sm mb-2">
                  Alterar Status do Pedido
                </label>
                <Dropdown
                  id="status-select"
                  value={order.status}
                  options={statusOptions}
                  onChange={(e) => handleStatusChange(e.value)}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Upload e Listagem de Anexos */}
          <Card className="shadow-2" title="Documentos Anexos">
            <div className="flex flex-column gap-4">
              {/* Botão de Upload Customizado */}
              <div className="flex flex-column align-items-center justify-content-center p-4 border-2 border-dashed border-300 border-round hover:border-primary transition-duration-200 cursor-pointer relative">
                <i className="pi pi-upload text-3xl text-400 mb-2"></i>
                <span className="text-600 font-semibold text-xs text-center">
                  Clique para anexar um documento<br />(PDF da Nota Fiscal, Comprovantes, etc.)
                </span>
                <input
                  type="file"
                  onChange={handleGenericFileUpload}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
              </div>

              {/* Lista de Arquivos */}
              <div>
                <h4 className="text-sm font-bold text-900 m-0 mb-3 uppercase tracking-wider text-500">
                  Arquivos do Pedido ({order.attachments?.length || 0})
                </h4>
                
                {!order.attachments || order.attachments.length === 0 ? (
                  <div className="text-center text-500 text-sm py-4 border-round bg-gray-50">
                    Nenhum documento anexado.
                  </div>
                ) : (
                  <div className="flex flex-column gap-2">
                    {order.attachments.map((file) => {
                      const isInvoice = file.name.toLowerCase().includes("nota_fiscal") || file.name.toLowerCase().includes("invoice");
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
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              icon="pi pi-eye"
                              className="p-button-text p-button-rounded p-button-sm text-primary"
                              onClick={() => handlePreview(file.id, file.name)}
                              tooltip="Visualizar"
                              tooltipOptions={{ position: "top" }}
                              loading={previewLoadingId === file.id}
                            />
                            <Button
                              icon="pi pi-download"
                              className="p-button-text p-button-rounded p-button-sm text-primary"
                              onClick={() => downloadAttachment(file)}
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
        </div>
      </div>

      {/* Diálogo de Envio (Prompts para Rastreamento e Nota Fiscal) */}
      <Dialog
        header="Detalhes de Envio do Pedido"
        visible={shippingDialogVisible}
        style={{ width: "90vw", maxWidth: "500px" }}
        onHide={() => setShippingDialogVisible(false)}
        footer={
          <div className="flex justify-content-end gap-2 mt-3">
            <Button label="Cancelar" className="p-button-text" onClick={() => setShippingDialogVisible(false)} />
            <Button label="Confirmar Envio" icon="pi pi-check" onClick={handleConfirmShipping} />
          </div>
        }
      >
        <div className="flex flex-column gap-4 py-2">
          <p className="m-0 text-700 text-sm">
            Para atualizar o status para <strong>ENVIADO (SHIPPED)</strong>, é obrigatório inserir o código de rastreamento e anexar o PDF da Nota Fiscal.
          </p>

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

          {invoiceError && (
            <div className="p-message p-message-error text-xs p-2 border-round">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              {invoiceError}
            </div>
          )}
        </div>
      </Dialog>

      {/* Diálogo de Pré-visualização de Documento */}
      <Dialog
        header={previewDoc?.name.replace(/^Nota_Fiscal_/, "") || "Visualizar Documento"}
        visible={!!previewDoc}
        style={{ width: "90vw", maxWidth: "800px" }}
        onHide={() => {
          if (previewDoc) window.URL.revokeObjectURL(previewDoc.url);
          setPreviewDoc(null);
        }}
        footer={
          <div className="flex justify-content-end gap-2 mt-3">
            <Button
              label="Fechar"
              className="p-button-text"
              onClick={() => {
                if (previewDoc) window.URL.revokeObjectURL(previewDoc.url);
                setPreviewDoc(null);
              }}
            />
            {previewDoc && (
              <Button
                label="Baixar Arquivo"
                icon="pi pi-download"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewDoc.url;
                  link.setAttribute("download", previewDoc.name);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
              />
            )}
          </div>
        }
      >
        {previewDoc && (
          <div className="flex justify-content-center align-items-center bg-gray-50 border-round p-3 overflow-auto" style={{ minHeight: "350px" }}>
            {previewDoc.type.startsWith("image/") ? (
              <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-30rem border-round shadow-2" />
            ) : previewDoc.type === "application/pdf" ? (
              <iframe src={previewDoc.url} title={previewDoc.name} className="w-full border-round shadow-2" style={{ height: "450px", border: "none" }}></iframe>
            ) : (
              <div className="text-center text-600 p-4">
                <i className="pi pi-file text-5xl mb-3 block opacity-50"></i>
                <span>Visualização indisponível para este formato. Utilize o botão de download para salvar o arquivo.</span>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
