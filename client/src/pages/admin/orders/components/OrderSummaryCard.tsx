import React from "react";
import { Card } from "primereact/card";

// Props do componente OrderSummaryCard
interface OrderSummaryCardProps {
  itemsSubtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  itemsSubtotal,
  shipping,
  discount,
  total
}) => {
  // Formata valor monetário em BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <Card className="shadow-2" title="Resumo de Valores">
      <div className="flex flex-column gap-2 text-sm">
        {/* Subtotal dos Itens */}
        <div className="flex justify-content-between">
          <span className="text-600">Subtotal dos Itens:</span>
          <span className="text-900 font-semibold">{formatCurrency(itemsSubtotal)}</span>
        </div>
        {/* Valor do Frete */}
        <div className="flex justify-content-between">
          <span className="text-600">Frete:</span>
          <span className="text-900 font-semibold">{formatCurrency(shipping)}</span>
        </div>
        {/* Desconto (se houver) */}
        {discount > 0 && (
          <div className="flex justify-content-between text-red-600 font-semibold">
            <span>Desconto Aplicado:</span>
            <span>- {formatCurrency(discount)}</span>
          </div>
        )}
        <hr className="border-top-1 border-300 my-2" />
        {/* Total Geral */}
        <div className="flex justify-content-between text-lg font-bold">
          <span className="text-900">Total Geral:</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  );
};
