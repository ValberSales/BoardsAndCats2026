import React, { useEffect, useState, useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { AuthContext } from "@/context/AuthContext";
import AdminService from "@/services/admin-service";
import type { IAdminUser } from "@/services/admin-service";

export function AdminUsersPage() {
  const toastRef = React.useRef<Toast>(null);
  const { authenticatedUser } = useContext(AuthContext);
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<IAdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Gestão de Usuários" },
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  const loadUsers = async () => {
    setLoading(true);
    const response = await AdminService.getUsers();
    if (response.success && response.data) {
      setUsers(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao carregar usuários.",
        life: 3000,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!globalFilterValue.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = globalFilterValue.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.cpf.includes(query) ||
        u.phone.includes(query)
    );
    setFilteredUsers(filtered);
  }, [globalFilterValue, users]);

  const handleActiveToggle = async (userId: number, currentStatus: boolean) => {
    // Evitar desativar a si mesmo
    if (authenticatedUser && authenticatedUser.username === users.find(u => u.id === userId)?.username) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Ação Negada",
        detail: "Você não pode desativar o seu próprio usuário administrador.",
        life: 4000,
      });
      return;
    }

    const response = await AdminService.updateUserActive(userId);
    if (response.success) {
      toastRef.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
        life: 3000,
      });
      loadUsers();
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível alterar o status do usuário.",
        life: 3000,
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: "USER" | "ADMIN") => {
    // Evitar mudar o próprio papel
    if (authenticatedUser && authenticatedUser.username === users.find(u => u.id === userId)?.username) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Ação Negada",
        detail: "Você não pode revogar seu próprio papel de administrador.",
        life: 4000,
      });
      return;
    }

    const response = await AdminService.updateUserRole(userId, newRole);
    if (response.success) {
      toastRef.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: `Perfil do usuário atualizado para ${newRole}.`,
        life: 3000,
      });
      loadUsers();
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível atualizar o papel do usuário.",
        life: 3000,
      });
    }
  };

  const roleOptions = [
    { label: "Usuário Comum", value: "USER" },
    { label: "Administrador", value: "ADMIN" },
  ];

  // Templates para colunas
  const activeTemplate = (rowData: IAdminUser) => {
    const isSelf = authenticatedUser?.username === rowData.username;
    return (
      <div className="flex align-items-center gap-2">
        <InputSwitch
          checked={rowData.enabled}
          onChange={() => handleActiveToggle(rowData.id, rowData.enabled)}
          disabled={isSelf}
        />
        <span className={`text-sm ${rowData.enabled ? "text-green-600 font-semibold" : "text-500"}`}>
          {rowData.enabled ? "Ativo" : "Inativo"}
        </span>
      </div>
    );
  };

  const roleTemplate = (rowData: IAdminUser) => {
    const isSelf = authenticatedUser?.username === rowData.username;
    return (
      <Dropdown
        value={rowData.role}
        options={roleOptions}
        onChange={(e) => handleRoleChange(rowData.id, e.value)}
        className="w-11rem p-inputtext-sm"
        disabled={isSelf}
      />
    );
  };

  const nameTemplate = (rowData: IAdminUser) => {
    const isSelf = authenticatedUser?.username === rowData.username;
    return (
      <div className="flex flex-column">
        <span className="font-bold text-900 flex align-items-center gap-1">
          {rowData.displayName}
          {isSelf && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 border-round font-semibold">
              Você
            </span>
          )}
        </span>
        <span className="text-500 text-xs mt-0.5">{rowData.username}</span>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
        <span className="text-xl font-bold text-900">Contas Cadastradas</span>
        <IconField iconPosition="left" className="w-full sm:w-20rem">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Pesquisar por nome, email, CPF..."
            className="w-full p-inputtext-sm"
          />
        </IconField>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />

      {/* Breadcrumb */}
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-900 m-0">Gestão de Usuários</h1>
        <p className="text-600 m-0 mt-1">
          Gerencie status ativo e permissões de acesso das contas registradas.
        </p>
      </div>

      {/* Table Card */}
      <div className="surface-card shadow-2 border-round p-4">
        <DataTable
          value={filteredUsers}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          dataKey="id"
          header={renderHeader()}
          emptyMessage="Nenhum usuário correspondente encontrado."
          responsiveLayout="stack"
          breakpoint="960px"
          className="p-datatable-striped"
        >
          <Column field="id" header="ID" sortable style={{ width: "8%" }} />
          <Column header="Nome e E-mail" body={nameTemplate} sortable field="displayName" style={{ width: "30%" }} />
          <Column field="cpf" header="CPF" sortable style={{ width: "15%" }} />
          <Column field="phone" header="Telefone" style={{ width: "15%" }} />
          <Column header="Perfil / Permissão" body={roleTemplate} sortable field="role" style={{ width: "16%" }} />
          <Column header="Status de Conta" body={activeTemplate} sortable field="enabled" style={{ width: "16%" }} />
        </DataTable>
      </div>
    </div>
  );
}
