import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import AdminService from "@/services/admin-service";
import type { IAdminOrder, IAdminAttachment } from "@/services/admin-service";
import { api } from "@/lib/axios";
import { OrderClientCard } from "./components/OrderClientCard";
import { OrderAddressCard } from "./components/OrderAddressCard";
import { OrderItemsTable } from "./components/OrderItemsTable";
import { OrderSummaryCard } from "./components/OrderSummaryCard";
import { OrderControlCard } from "./components/OrderControlCard";
import { OrderDocumentsCard } from "./components/OrderDocumentsCard";
import { ShippingDialog } from "./components/ShippingDialog";
import { PreviewDocDialog } from "./components/PreviewDocDialog";

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

  const handleStatusChange = async (newStatus: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED") => {
    if (!order) return;

    if (newStatus === "SHIPPED") {
      // Abre o diálogo de envio para obter o código e a nota fiscal
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
  const handleConfirmShipping = async (trackingCode: string, invoiceFile: File | null) => {
    if (!order) return;

    try {
      if (invoiceFile) {
        // Upload do documento primeiro
        const docResponse = await AdminService.uploadOrderDocument(order.id, invoiceFile);
        if (!docResponse.success) {
          toastRef.current?.show({
            severity: "error",
            summary: "Erro ao Anexar",
            detail: "Falha ao anexar a Nota Fiscal no MinIO.",
            life: 3000,
          });
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
        toastRef.current?.show({
          severity: "error",
          summary: "Erro ao Atualizar",
          detail: "Falha ao atualizar o status do pedido.",
          life: 3000,
        });
      }
    } catch (e) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro no Processo",
        detail: "Ocorreu um erro no processo de envio.",
        life: 3000,
      });
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


  const getItemsSubtotal = () => {
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      {/* Cabeçalho */}
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
          <OrderClientCard
            clientName={order.clientName}
            clientCpf={order.clientCpf}
            clientEmail={order.clientEmail}
            clientPhone={order.clientPhone}
          />

          <OrderAddressCard address={order.shippingAddress} />

          <OrderItemsTable items={order.items} />

          <OrderSummaryCard
            itemsSubtotal={getItemsSubtotal()}
            shipping={order.shipping}
            discount={order.discount}
            total={order.total}
          />
        </div>

        {/* Coluna Direita: Controle do Pedido e Anexos */}
        <div className="col-12 lg:col-4 p-2">
          <OrderControlCard
            paymentMethod={order.paymentMethod}
            trackingCode={order.trackingCode}
            status={order.status}
            onStatusChange={handleStatusChange}
          />

          <OrderDocumentsCard
            attachments={order.attachments}
            previewLoadingId={previewLoadingId}
            onGenericFileUpload={handleGenericFileUpload}
            onPreview={handlePreview}
            onDownload={downloadAttachment}
          />
        </div>
      </div>

      <ShippingDialog
        visible={shippingDialogVisible}
        onHide={() => setShippingDialogVisible(false)}
        onConfirm={handleConfirmShipping}
        initialTrackingCode={order.trackingCode}
        hasExistingInvoice={order.attachments?.some(a => a.name.toLowerCase().includes("nota_fiscal") || a.name.toLowerCase().includes("invoice")) || false}
      />

      {/* Diálogo de Pré-visualização de Documento */}
      <PreviewDocDialog
        visible={!!previewDoc}
        onHide={() => {
          if (previewDoc) window.URL.revokeObjectURL(previewDoc.url);
          setPreviewDoc(null);
        }}
        previewDoc={previewDoc}
      />
    </div>
  );
}
