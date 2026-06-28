import React from "react";
import { Card } from "primereact/card";

// Interface para o endereço de entrega
interface IShippingAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

// Props do componente OrderAddressCard
interface OrderAddressCardProps {
  address: IShippingAddress;
}

export const OrderAddressCard: React.FC<OrderAddressCardProps> = ({ address }) => {
  return (
    <Card className="shadow-2 mb-4" title="Endereço de Entrega">
      <div className="text-sm leading-relaxed">
        {/* Rua e Número */}
        <p className="m-0 font-bold text-900">
          {address.street}, {address.number}
        </p>
        {/* Bairro */}
        <p className="m-0 text-700">
          Bairro: {address.neighborhood}
        </p>
        {/* Cidade, Estado e CEP */}
        <p className="m-0 text-700">
          {address.city} - {address.state}, CEP: {address.zip}
        </p>
      </div>
    </Card>
  );
};
