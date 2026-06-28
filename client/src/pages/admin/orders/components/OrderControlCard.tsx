import React from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";

// Opções de status disponíveis
const statusOptions = [
  { label: "Pendente (PENDING)", value: "PENDING" },
  { label: "Pago (PAID)", value: "PAID" },
  { label: "Enviado (SHIPPED)", value: "SHIPPED" },
  { label: "Entregue (DELIVERED)", value: "DELIVERED" },
  { label: "Cancelado (CANCELED)", value: "CANCELED" },
];

// Props do componente OrderControlCard
interface OrderControlCardProps {
  paymentMethod: string;
  trackingCode?: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";
  onStatusChange: (newStatus: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED") => void;
}

export const OrderControlCard: React.FC<OrderControlCardProps> = ({
  paymentMethod,
  trackingCode,
  status,
  onStatusChange
}) => {
  return (
    <Card className="shadow-2 mb-4" title="Controle do Pedido">
      <div className="flex flex-column gap-4">
        {/* Método de Pagamento */}
        <div>
          <span className="block text-500 font-semibold text-sm mb-2">Forma de Pagamento</span>
          <span className="text-900 font-semibold flex align-items-center gap-2">
            <i className="pi pi-credit-card text-primary"></i> {paymentMethod}
          </span>
        </div>

        {/* Código de Rastreio (se disponível) */}
        {trackingCode && (
          <div>
            <span className="block text-500 font-semibold text-sm mb-2">Código de Rastreio</span>
            <span className="text-900 font-bold bg-gray-100 px-3 py-1 border-round border-1 border-300 text-sm">
              {trackingCode}
            </span>
          </div>
        )}

        {/* Seleção do Status */}
        <div>
          <label htmlFor="status-select" className="block text-500 font-semibold text-sm mb-2">
            Alterar Status do Pedido
          </label>
          <Dropdown
            id="status-select"
            value={status}
            options={statusOptions}
            onChange={(e) => onStatusChange(e.value)}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};
