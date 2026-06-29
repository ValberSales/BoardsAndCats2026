import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { BreadCrumb } from "primereact/breadcrumb";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import LogService from "@/services/log-service";

interface IOperationLog {
  id: number;
  adminEmail: string;
  operation: string;
  details: string;
  timestamp: string;
}

export function AdminLogsPage() {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);
  const [logs, setLogs] = useState<IOperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Logs de Auditoria" }
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  const loadLogs = async () => {
    setLoading(true);
    const response = await LogService.getLogs();
    if (response.success && Array.isArray(response.data)) {
      setLogs(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao carregar logs de auditoria do banco de dados.",
        life: 3000
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getOperationSeverity = (op: string) => {
    switch (op) {
      case "EMAIL_SENT_SUCCESS":
      case "UPLOAD_ORDER_DOCUMENT":
        return "success";
      case "EMAIL_SENT_FAILURE":
        return "danger";
      case "TOGGLE_USER_ACTIVE":
      case "UPDATE_USER_ROLE":
        return "warning";
      case "UPDATE_ORDER_STATUS":
        return "info";
      default:
        return "secondary";
    }
  };

  const getOperationLabel = (op: string) => {
    switch (op) {
      case "EMAIL_SENT_SUCCESS":
        return "E-mail Enviado";
      case "EMAIL_SENT_FAILURE":
        return "Falha no E-mail";
      case "UPLOAD_ORDER_DOCUMENT":
        return "Documento Anexado";
      case "TOGGLE_USER_ACTIVE":
        return "Status do Usuário";
      case "UPDATE_USER_ROLE":
        return "Perfil do Usuário";
      case "UPDATE_ORDER_STATUS":
        return "Status do Pedido";
      default:
        return op;
    }
  };

  const formatTimestamp = (ts: string) => {
    if (!ts) return "";
    try {
      const date = new Date(ts);
      return date.toLocaleString("pt-BR");
    } catch (e) {
      return ts;
    }
  };

  const timestampBodyTemplate = (rowData: IOperationLog) => {
    return formatTimestamp(rowData.timestamp);
  };

  const operationBodyTemplate = (rowData: IOperationLog) => {
    return (
      <Tag
        value={getOperationLabel(rowData.operation)}
        severity={getOperationSeverity(rowData.operation) as any}
        className="text-xs font-bold px-2 py-1"
      />
    );
  };

  const filteredLogs = logs.filter(log => 
    log.adminEmail.toLowerCase().includes(filterText.toLowerCase()) ||
    log.operation.toLowerCase().includes(filterText.toLowerCase()) ||
    log.details.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-5 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0">Logs de Auditoria</h1>
          <p className="text-600 m-0 mt-1">Monitore alterações de pedidos, envios de e-mails e atualizações de usuários registradas no banco.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-content-end">
          <Button 
            label="Voltar ao Painel" 
            icon="pi pi-arrow-left" 
            className="p-button-outlined" 
            onClick={() => navigate("/admin/dashboard")} 
          />
          <Button 
            label="Atualizar" 
            icon="pi pi-refresh" 
            onClick={() => loadLogs()} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="surface-card shadow-2 border-round p-4 mb-4">
        <div className="flex justify-content-between align-items-center flex-wrap gap-3">
          <span className="text-xl font-bold text-800">Registros de Operações</span>
          <IconField iconPosition="left" className="w-full sm:w-20rem">
            <InputIcon className="pi pi-search" />
            <InputText
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Pesquisar por operação, usuário..."
              className="w-full p-inputtext-sm"
            />
          </IconField>
        </div>
      </div>

      {/* VERSÃO DESKTOP: Tabela de Logs */}
      <div className="admin-table-desktop">
        <div className="surface-card shadow-2 border-round p-4">
          <DataTable
            value={filteredLogs}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            emptyMessage="Nenhum log de operação encontrado."
            responsiveLayout="scroll"
            className="p-datatable-striped"
          >
            <Column field="id" header="ID" sortable style={{ width: "8%" }} />
            <Column header="Data/Hora" body={timestampBodyTemplate} sortable field="timestamp" style={{ width: "18%" }} />
            <Column field="adminEmail" header="Usuário/Responsável" sortable style={{ width: "22%" }} />
            <Column header="Operação" body={operationBodyTemplate} sortable field="operation" style={{ width: "18%" }} />
            <Column field="details" header="Detalhes da Ação" style={{ width: "34%" }} />
          </DataTable>
        </div>
      </div>

      {/* VERSÃO MOBILE: Lista de Cards de Logs */}
      <div className="admin-mobile-list">
        {loading ? (
          <div className="text-center p-4">
            <i className="pi pi-spin pi-spinner text-2xl text-primary" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center p-4 text-500 surface-card border-round-xl border-1 border-100">
            Nenhum log de operação encontrado.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="admin-mobile-card">
              <div className="admin-mobile-header">
                <span className="font-bold text-900">ID: #{log.id}</span>
                <Tag
                  value={getOperationLabel(log.operation)}
                  severity={getOperationSeverity(log.operation) as any}
                  className="text-xs font-bold"
                />
              </div>
              <div className="admin-mobile-row">
                <span className="admin-mobile-label">Data/Hora</span>
                <span className="admin-mobile-value">{formatTimestamp(log.timestamp)}</span>
              </div>
              <div className="admin-mobile-row">
                <span className="admin-mobile-label">Usuário</span>
                <span className="admin-mobile-value font-semibold">{log.adminEmail}</span>
              </div>
              <div className="mt-3 pt-3 border-top-1 border-100">
                <span className="block text-xs text-500 font-semibold mb-1">Detalhes da Ação</span>
                <p className="m-0 text-sm text-800 font-mono bg-50 p-2 border-round" style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
                  {log.details}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
