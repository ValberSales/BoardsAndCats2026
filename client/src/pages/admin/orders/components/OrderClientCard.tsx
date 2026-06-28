import React from "react";
import { Card } from "primereact/card";

// Props do componente OrderClientCard
interface OrderClientCardProps {
  clientName: string;
  clientCpf: string;
  clientEmail: string;
  clientPhone: string;
}

export const OrderClientCard: React.FC<OrderClientCardProps> = ({
  clientName,
  clientCpf,
  clientEmail,
  clientPhone
}) => {
  return (
    <Card className="shadow-2 mb-4" title="Informações do Cliente">
      <div className="grid text-sm">
        {/* Nome do Cliente */}
        <div className="col-12 sm:col-6 mb-2">
          <span className="block text-500 font-semibold mb-1">Nome Completo</span>
          <span className="text-900 font-bold">{clientName}</span>
        </div>
        {/* CPF do Cliente */}
        <div className="col-12 sm:col-6 mb-2">
          <span className="block text-500 font-semibold mb-1">CPF</span>
          <span className="text-900">{clientCpf}</span>
        </div>
        {/* E-mail do Cliente */}
        <div className="col-12 sm:col-6 mb-2">
          <span className="block text-500 font-semibold mb-1">E-mail</span>
          <span className="text-900">{clientEmail}</span>
        </div>
        {/* Telefone do Cliente */}
        <div className="col-12 sm:col-6 mb-2">
          <span className="block text-500 font-semibold mb-1">Telefone</span>
          <span className="text-900">{clientPhone}</span>
        </div>
      </div>
    </Card>
  );
};
