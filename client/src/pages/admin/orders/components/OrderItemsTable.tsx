import React from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

// Interface para o item do pedido
interface IOrderItem {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// Props do componente OrderItemsTable
interface OrderItemsTableProps {
  items: IOrderItem[];
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items }) => {
  // Formata o valor monetário para a moeda brasileira (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <Card className="shadow-2 mb-4" title="Itens do Pedido">
      <DataTable value={items} className="p-datatable-sm" responsiveLayout="scroll">
        <Column field="productName" header="Produto" style={{ fontWeight: "bold" }} />
        <Column field="unitPrice" header="Preço Unitário" body={(row) => formatCurrency(row.unitPrice)} />
        <Column field="quantity" header="Qtd" style={{ textAlign: "center" }} />
        <Column field="subtotal" header="Subtotal" body={(row) => formatCurrency(row.subtotal)} style={{ textAlign: "right" }} />
      </DataTable>
    </Card>
  );
};
