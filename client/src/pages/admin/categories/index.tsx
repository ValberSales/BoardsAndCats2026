import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";
import CategoryService from "@/services/category-service";

interface ICategory {
  id?: number;
  name: string;
}

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [category, setCategory] = useState<ICategory>({ name: "" });
  const [submitted, setSubmitted] = useState(false);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Categorias" }
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const response = await CategoryService.findAll();
    if (response.success && Array.isArray(response.data)) {
      setCategories(response.data);
    } else {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao buscar categorias.",
        life: 3000
      });
    }
    setLoading(false);
  };

  const openNew = () => {
    setCategory({ name: "" });
    setSubmitted(false);
    setCategoryDialog(true);
  };

  const hideDialog = () => {
    setCategoryDialog(false);
    setSubmitted(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const saveCategory = async () => {
    setSubmitted(true);

    if (category.name.trim()) {
      const response = await CategoryService.save(category);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: category.id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!",
          life: 3000
        });
        loadCategories();
        setCategoryDialog(false);
        setCategory({ name: "" });
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: response.message || "Erro ao salvar categoria.",
          life: 3000
        });
      }
    }
  };

  const editCategory = (cat: ICategory) => {
    setCategory({ ...cat });
    setCategoryDialog(true);
  };

  const confirmDeleteCategory = (cat: ICategory) => {
    setCategory(cat);
    setDeleteDialog(true);
  };

  const deleteCategory = async () => {
    if (category.id) {
      const response = await CategoryService.remove(category.id);
      if (response.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Categoria excluída com sucesso!",
          life: 3000
        });
        loadCategories();
        setDeleteDialog(false);
        setCategory({ name: "" });
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao excluir categoria (verifique se há produtos vinculados).",
          life: 4000
        });
      }
    }
  };

  const actionBodyTemplate = (rowData: ICategory) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="p-button-sm"
          onClick={() => editCategory(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          className="p-button-sm"
          onClick={() => confirmDeleteCategory(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" onClick={saveCategory} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
      <Button label="Sim, Excluir" icon="pi pi-check" severity="danger" onClick={deleteCategory} />
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      <Toast ref={toastRef} />
      <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent pl-0 mb-4" />

      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-5 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0">Gestão de Categorias</h1>
          <p className="text-600 m-0 mt-1">Cadastre e organize as divisões de produtos do catálogo.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Voltar ao Painel" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => navigate("/admin/dashboard")} />
          <Button label="Nova Categoria" icon="pi pi-plus" onClick={openNew} />
        </div>
      </div>

      <div className="surface-card shadow-2 border-round p-4">
        <DataTable
          value={categories}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhuma categoria encontrada."
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" sortable style={{ width: "15%" }} />
          <Column field="name" header="Nome da Categoria" sortable style={{ width: "65%" }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ width: "20%", minWidth: "8rem" }} />
        </DataTable>
      </div>

      {/* Cadastrar/Editar Categoria */}
      <Dialog
        visible={categoryDialog}
        style={{ width: "450px" }}
        header={category.id ? "Editar Categoria" : "Nova Categoria"}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="field mb-3">
          <label htmlFor="name" className="font-bold mb-2 block">Nome da Categoria *</label>
          <InputText
            id="name"
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            required
            autoFocus
            className={submitted && !category.name ? "p-invalid" : ""}
          />
          {submitted && !category.name && (
            <small className="p-error block mt-1">Nome é obrigatório.</small>
          )}
        </div>
      </Dialog>

      {/* Deletar Categoria */}
      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirmar Exclusão"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content flex align-items-center gap-3">
          <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: "2rem" }} />
          {category && (
            <span>
              Tem certeza que deseja excluir a categoria <strong>{category.name}</strong>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
