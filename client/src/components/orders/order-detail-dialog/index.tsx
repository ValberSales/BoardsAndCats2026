import { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { API_BASE_URL, api } from "@/lib/axios";
import type { IOrder, IOrderItem } from "@/types/order";
import OrderService from "@/services/order-service";

import "./OrderDetailDialog.css";

interface OrderDetailDialogProps {
    visible: boolean;
    onHide: () => void;
    order: IOrder | null;
}

const paymentMap: Record<string, string> = {
    'DEBIT_CARD': 'Débito',
    'CREDIT_CARD': 'Crédito',
    'PIX': 'Pix',
    'BOLETO': 'Boleto Bancário'
};

export const OrderDetailDialog = ({ visible, onHide, order }: OrderDetailDialogProps) => {
    const toast = useRef<Toast>(null);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);
    const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);

    const handlePreview = async (docId: number, fileName: string) => {
        if (!order) return;
        setPreviewLoadingId(docId);
        try {
            const response = await api.get(`/orders/${order.id}/documents/${docId}/download`, {
                responseType: "blob",
            });
            const objectUrl = window.URL.createObjectURL(response.data);
            setPreviewDoc({ url: objectUrl, name: fileName, type: response.data.type || "application/pdf" });
        } catch (e) {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: "Falha ao carregar pré-visualização.",
                life: 3000,
            });
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const handleClose = () => {
        if (previewDoc) {
            window.URL.revokeObjectURL(previewDoc.url);
            setPreviewDoc(null);
        }
        onHide();
    };

    if (!order) return null;

    const events = [
        { status: 'PENDING', label: 'Recebido', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
        { status: 'PAID', label: 'Pago', icon: 'pi pi-wallet', color: '#673AB7' },
        { status: 'SHIPPED', label: 'Enviado', icon: 'pi pi-truck', color: '#FF9800' },
        { status: 'DELIVERED', label: 'Entregue', icon: 'pi pi-check', color: '#607D8B' },
        { status: 'CANCELED', label: 'Cancelado', icon: 'pi pi-times', color: '#FF0000' }
    ];

    const currentEventIndex = events.findIndex(e => e.status === order.status);
    const timelineEvents = events.map((e, i) => ({
        ...e,
        active: i <= currentEventIndex && order.status !== 'CANCELED'
    })).filter(e => {
        if (order.status === 'CANCELED') return e.status === 'PENDING' || e.status === 'CANCELED';
        return e.status !== 'CANCELED';
    });

    const copyTracking = () => {
        if (order.trackingCode) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(order.trackingCode);
                toast.current?.show({ severity: 'success', summary: 'Copiado', detail: 'Código copiado!', life: 2000 });
            } else {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = order.trackingCode;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    toast.current?.show({ severity: 'success', summary: 'Copiado', detail: 'Código copiado!', life: 2000 });
                } catch (err) {
                    console.error('Erro ao copiar', err);
                }
            }
        }
    };

    const customizedMarker = (item: any) => {
        return (
            <span className="custom-marker" style={{ backgroundColor: item.active ? item.color : 'var(--surface-300)' }}>
                <i className={`${item.icon} text-lg`}></i>
            </span>
        );
    };

    const customizedContent = (item: any) => {
        const displayDate = order.statusDate ? new Date(order.statusDate) : new Date(order.date);
        return (
            <div className={`flex flex-column ${!item.active ? 'opacity-50' : ''}`}>
                <span className="font-bold text-900 text-lg mb-1">{item.label}</span>
                {item.status === order.status && (
                    <div className="text-sm text-color-secondary">
                        {displayDate.toLocaleDateString('pt-BR')} às {displayDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        );
    };

    const subTotalItems = order.items.reduce((acc, item) => acc + item.subtotal, 0);

    const rawPaymentDesc = order.payment?.description || '';
    let displayPayment = 'Não informado';

    if (rawPaymentDesc) {
        const parts = rawPaymentDesc.split(' - ');
        const type = parts[0];
        const detail = parts.slice(1).join(' - ');
        const translatedType = paymentMap[type] || type;
        displayPayment = detail ? `${translatedType} - ${detail}` : translatedType;
    }

    return (
        <Dialog
            visible={visible}
            onHide={handleClose}
            header={`Pedido #${order.id}`}
            className="order-detail-dialog"
            modal
            draggable={false}
            resizable={false}
        >
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12 md:col-5">
                    <Card className="detail-card shadow-none h-full">
                        <span className="section-title mb-4">Status do Pedido</span>

                        <Timeline
                            value={timelineEvents}
                            layout="vertical"
                            align="left"
                            marker={customizedMarker}
                            content={customizedContent}
                            className="custom-timeline w-full"
                        />

                        {order.trackingCode && (
                            <>
                                <Divider className="my-4" />
                                <span className="section-title">Código de Rastreio</span>
                                <div className="tracking-box">
                                    <div className="flex align-items-center gap-3">
                                        <i className="pi pi-box text-primary text-xl"></i>
                                        <span className="tracking-code">{order.trackingCode}</span>
                                    </div>
                                    <Button
                                        icon="pi pi-copy"
                                        rounded
                                        text
                                        severity="secondary"
                                        tooltip="Copiar"
                                        onClick={copyTracking}
                                    />
                                </div>
                            </>
                        )}

                        {order.documents && order.documents.length > 0 && (
                            <>
                                <Divider className="my-4" />
                                <span className="section-title">Documentos e Notas Fiscais</span>
                                <div className="flex flex-column gap-2 mt-3">
                                    {order.documents.map((doc) => {
                                        const isInvoice = doc.fileName.toLowerCase().includes("nota_fiscal") || doc.fileName.toLowerCase().includes("invoice");
                                        return (
                                            <div
                                                key={doc.id}
                                                className="flex align-items-center justify-content-between p-3 surface-100 border-round border-left-3 border-primary"
                                            >
                                                <div className="flex align-items-center gap-2 overflow-hidden mr-2">
                                                    <i className={`pi ${isInvoice ? "pi-file-pdf text-red-500 text-xl" : "pi-file text-700 text-xl"}`}></i>
                                                    <span className="text-xs font-bold text-900 truncate" style={{ maxWidth: '180px' }} title={doc.fileName}>
                                                        {doc.fileName.replace(/^Nota_Fiscal_/, "")}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <Button
                                                        icon="pi pi-eye"
                                                        rounded
                                                        text
                                                        size="small"
                                                        className="text-primary flex-shrink-0"
                                                        onClick={() => handlePreview(doc.id, doc.fileName)}
                                                        tooltip="Visualizar"
                                                        tooltipOptions={{ position: "top" }}
                                                        loading={previewLoadingId === doc.id}
                                                    />
                                                    <Button
                                                        icon="pi pi-download"
                                                        rounded
                                                        text
                                                        size="small"
                                                        className="text-primary flex-shrink-0"
                                                        onClick={() => OrderService.downloadDocument(order.id, doc.id, doc.fileName)}
                                                        tooltip="Baixar Documento"
                                                        tooltipOptions={{ position: "top" }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        <Divider className="my-4" />

                        <span className="section-title">Endereço de Entrega</span>
                        <p className="address-info">
                            <span className="font-semibold block text-900 mb-1">{order.address.street}</span>
                            {order.address.city} - {order.address.state}<br />
                            CEP: {order.address.zip}
                        </p>
                    </Card>
                </div>

                <div className="col-12 md:col-7">
                    <Card className="detail-card shadow-none h-full">
                        <span className="section-title">Itens Comprados</span>

                        <div className="flex flex-column mb-2">
                            {order.items?.map((item: IOrderItem, index: number) => (
                                <div key={index} className="order-item-row">
                                    <img
                                        src={`${API_BASE_URL}${item.product.imageUrl}`}
                                        alt={item.product.name}
                                        className="order-item-img"
                                    />
                                    <div className="flex-1">
                                        <span className="font-semibold text-900 block mb-1">{item.product.name}</span>
                                        <div className="text-sm text-gray-500">
                                            {item.quantity}x {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                    <span className="font-bold text-900">
                                        {item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="financial-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span className="font-medium text-900">
                                    {subTotalItems.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span>Frete</span>
                                <span className={order.shipping > 0 ? "font-medium text-900" : "font-medium text-green-600"}>
                                    {order.shipping > 0
                                        ? order.shipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        : 'Grátis'}
                                </span>
                            </div>

                            {order.discount > 0 && (
                                <div className="summary-row text-green-600">
                                    <span>Desconto</span>
                                    <span>- {order.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            )}

                            <Divider className="my-2" />

                            <div className="total-row">
                                <span>Total Pago</span>
                                <span>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>

                            <div className="mt-3 text-right">
                                <Tag
                                    value={displayPayment}
                                    icon="pi pi-credit-card"
                                    severity="info"
                                    className="text-sm px-3"
                                    rounded
                                ></Tag>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

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
        </Dialog>
    );
};