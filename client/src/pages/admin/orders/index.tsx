import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { BreadCrumb } from "primereact/breadcrumb";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import AdminService from "@/services/admin-service";
import type { IAdminOrder } from "@/services/admin-service";

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");

  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Acompanhamento de Pedidos" },
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  const loadOrders = async () => {
    setLoading(true);
    const response = await AdminService.getOrders();
    if (response.success && response.data) {
      setOrders(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [statusParam]);

  // Aplicar filtros
  useEffect(() => {
    let result = [...orders];

    // 1. Filtrar por cliente (Nome ou CPF)
    if (searchCustomer.trim()) {
      const query = searchCustomer.toLowerCase();
      result = result.filter(
        (o) =>
          o.clientName.toLowerCase().includes(query) ||
          o.clientCpf.includes(query)
      );
    }

    // 2. Filtrar por Status
    if (selectedStatus) {
      result = result.filter((o) => o.status === selectedStatus);
    }

    // 3. Filtrar por Data do Pedido
    if (selectedDate) {
      // Ajusta timezone para comparação local YYYY-MM-DD
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const filterDateStr = `${yyyy}-${mm}-${dd}`;

      result = result.filter((o) => o.date === filterDateStr);
    }

    setFilteredOrders(result);
  }, [searchCustomer, selectedStatus, selectedDate, orders]);

  const clearFilters = () => {
    setSearchCustomer("");
    setSelectedStatus(null);
    setSelectedDate(null);
  };

  // Status badges
  const statusOptions = [
    { label: "Pendente", value: "PENDING" },
    { label: "Pago", value: "PAID" },
    { label: "Enviado", value: "SHIPPED" },
    { label: "Entregue", value: "DELIVERED" },
    { label: "Cancelado", value: "CANCELED" },
  ];

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "PAID":
        return "info";
      case "SHIPPED":
        return "help"; // roxo no PrimeReact
      case "DELIVERED":
        return "success";
      case "CANCELED":
        return "danger";
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "PENDENTE";
      case "PAID":
        return "PAGO";
      case "SHIPPED":
        return "ENVIADO";
      case "DELIVERED":
        return "ENTREGUE";
      case "CANCELED":
        return "CANCELADO";
      default:
        return status;
    }
  };

  // Templates
  const statusTemplate = (rowData: IAdminOrder) => {
    return (
      <Tag
        value={getStatusLabel(rowData.status)}
        severity={getStatusSeverity(rowData.status) as any}
        className="text-xs px-2 py-1 font-bold"
      />
    );
  };

  const currencyTemplate = (rowData: IAdminOrder) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.total);
  };

  const dateTemplate = (rowData: IAdminOrder) => {
    if (!rowData.date) return "";
    const [year, month, day] = rowData.date.split("-");
    return `${day}/${month}/${year}`;
  };

  const actionsTemplate = (rowData: IAdminOrder) => {
    return (
      <Button
        icon="pi pi-search"
        tooltip="Ver Detalhes"
        tooltipOptions={{ position: "left" }}
        className="p-button-rounded p-button-text p-button-sm"
        onClick={() => navigate(`/admin/orders/${rowData.id}`)}
      />
    );
  };

  const clientTemplate = (rowData: IAdminOrder) => {
    return (
      <div className="flex flex-column">
        <span className="font-semibold text-900">{rowData.clientName}</span>
        <span className="text-500 text-xs">CPF: {rowData.clientCpf}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      {/* Breadcrumb */}
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      {/* Title */}
      <div className="mb-5 flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0">Acompanhamento de Pedidos</h1>
          <p className="text-600 m-0 mt-1">
            Filtre, visualize detalhes e atualize o status de envio dos pedidos.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="surface-card shadow-2 border-round p-4 mb-4">
        <h3 className="text-lg font-bold text-900 m-0 mb-3 flex align-items-center gap-2">
          <i className="pi pi-filter text-primary"></i> Filtros de Busca
        </h3>
        <div className="grid">
          {/* Customer Search */}
          <div className="col-12 md:col-4 p-2">
            <label htmlFor="customer" className="block text-900 font-semibold text-sm mb-2">
              Cliente (Nome ou CPF)
            </label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-search" />
              <InputText
                id="customer"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Ex: Maria Lima ou 111.111..."
                className="w-full p-inputtext-sm"
              />
            </IconField>
          </div>

          {/* Status Search */}
          <div className="col-12 sm:col-6 md:col-3 p-2">
            <label htmlFor="status" className="block text-900 font-semibold text-sm mb-2">
              Status do Pedido
            </label>
            <Dropdown
              id="status"
              value={selectedStatus}
              options={statusOptions}
              onChange={(e) => setSelectedStatus(e.value)}
              placeholder="Selecionar Status"
              showClear
              className="w-full p-inputtext-sm"
            />
          </div>

          {/* Date Search */}
          <div className="col-12 sm:col-6 md:col-3 p-2">
            <label htmlFor="date" className="block text-900 font-semibold text-sm mb-2">
              Data do Pedido
            </label>
            <Calendar
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.value as Date)}
              dateFormat="dd/mm/yy"
              placeholder="Selecionar Data"
              showIcon
              showButtonBar
              className="w-full p-inputtext-sm"
            />
          </div>

          {/* Clear Button */}
          <div className="col-12 md:col-2 p-2 flex align-items-end justify-content-start md:justify-content-end">
            <Button
              label="Limpar Filtros"
              icon="pi pi-filter-slash"
              className="p-button-outlined p-button-sm w-full md:w-auto"
              onClick={clearFilters}
              disabled={!searchCustomer && !selectedStatus && !selectedDate}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card shadow-2 border-round p-4">
        <DataTable
          value={filteredOrders}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          dataKey="id"
          emptyMessage="Nenhum pedido correspondente encontrado."
          responsiveLayout="stack"
          breakpoint="960px"
          className="p-datatable-striped"
        >
          <Column field="id" header="Nº Pedido" sortable style={{ width: "12%" }} />
          <Column header="Data" body={dateTemplate} sortable field="date" style={{ width: "15%" }} />
          <Column header="Cliente" body={clientTemplate} sortable field="clientName" style={{ width: "30%" }} />
          <Column field="paymentMethod" header="Método de Pagamento" style={{ width: "20%" }} />
          <Column header="Total" body={currencyTemplate} sortable field="total" style={{ width: "13%" }} />
          <Column header="Status" body={statusTemplate} sortable field="status" style={{ width: "15%" }} />
          <Column body={actionsTemplate} style={{ width: "8%", textAlign: "center" }} />
        </DataTable>
      </div>
    </div>
  );
}
