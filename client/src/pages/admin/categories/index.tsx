import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";
import { Tag } from "primereact/tag";
import CategoryService from "@/services/category-service";
import { CategoryIcon } from "@/components/common/category-icon";
import { CategoryDialog } from "./components/CategoryDialog";
import { DeleteCategoryDialog } from "./components/DeleteCategoryDialog";

interface ICategory {
  id?: number;
  name: string;
  icon?: string;
}

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const toastRef = useRef<Toast>(null);
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [category, setCategory] = useState<ICategory>({ name: "", icon: "" });
  const [submitted, setSubmitted] = useState(false);

  const breadcrumbItems = [
    { label: "Painel Admin", url: "/admin/dashboard" },
    { label: "Categorias" }
  ];
  const breadcrumbHome = { icon: "pi pi-home", url: "/admin/dashboard" };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setHoverIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setHoverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && hoverIndex !== null && draggedIndex !== hoverIndex) {
      setCategories(prev => {
        const updated = [...prev];
        const draggedItem = updated[draggedIndex];
        updated.splice(draggedIndex, 1);
        updated.splice(hoverIndex, 0, draggedItem);
        
        const orderIds = updated.map(c => c.id!).filter(Boolean);
        localStorage.setItem("categoryOrder", JSON.stringify(orderIds));
        
        const favIds = updated.slice(0, 3).map(c => c.id!).filter(Boolean);
        localStorage.setItem("favoriteCategories", JSON.stringify(favIds));
        window.dispatchEvent(new Event("favoritesChanged"));
        
        return updated;
      });

      toastRef.current?.show({
        severity: "success",
        summary: "Ordem Atualizada",
        detail: "Ordem das categorias salva com sucesso!",
        life: 2000
      });
    }
    setDraggedIndex(null);
    setHoverIndex(null);
  };

  const getRowStyle = (index: number) => {
    if (draggedIndex === null || hoverIndex === null) return {};
    if (index === draggedIndex) {
      return {
        opacity: 0.4,
        backgroundColor: "var(--surface-hover)",
        border: "1px dashed var(--primary-color)"
      };
    }

    if (draggedIndex < hoverIndex) {
      if (index > draggedIndex && index <= hoverIndex) {
        return { transform: "translateY(-100%)" };
      }
    } else if (draggedIndex > hoverIndex) {
      if (index >= hoverIndex && index < draggedIndex) {
        return { transform: "translateY(100%)" };
      }
    }

    return {};
  };

  const loadCategories = async () => {
    setLoading(true);
    const response = await CategoryService.findAll();
    if (response.success && Array.isArray(response.data)) {
      const dbCategories = response.data;
      
      const savedOrder = localStorage.getItem("categoryOrder");
      let orderedCategories = dbCategories;
      
      if (savedOrder) {
        const orderIds: number[] = JSON.parse(savedOrder);
        orderedCategories = [...dbCategories].sort((a, b) => {
          const indexA = orderIds.indexOf(a.id!);
          const indexB = orderIds.indexOf(b.id!);
          
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      } else {
        const initialOrder = dbCategories.map(c => c.id!);
        localStorage.setItem("categoryOrder", JSON.stringify(initialOrder));
      }
      
      setCategories(orderedCategories);
      
      const favIds = orderedCategories.slice(0, 3).map(c => c.id!).filter(Boolean);
      localStorage.setItem("favoriteCategories", JSON.stringify(favIds));
      window.dispatchEvent(new Event("favoritesChanged"));
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
    setCategory({ name: "", icon: "" });
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

    if (category.name.trim() && category.icon?.trim()) {
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
        setCategory({ name: "", icon: "" });
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

  const menuStatusTemplate = (rowData: ICategory) => {
    const idx = categories.findIndex(c => c.id === rowData.id);
    const isFav = idx !== -1 && idx < 3;
    if (!isFav) return null;
    return (
      <Tag
        value="No Menu Principal"
        severity="success"
        icon="pi pi-star-fill"
        className="text-xs font-bold px-2 py-1"
      />
    );
  };


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

      <div className="surface-card shadow-2 border-round p-4 overflow-x-auto">
        <div className="p-datatable p-component p-datatable-responsive-scroll categories-drag-table">
          <table className="p-datatable-table w-full" style={{ borderCollapse: "collapse" }}>
            <thead className="p-datatable-thead">
              <tr>
                <th className="p-3 text-center" style={{ width: "4rem" }}>Reordenar</th>
                <th className="p-3 text-left" style={{ width: "10%" }}>ID</th>
                <th className="p-3 text-left" style={{ width: "45%" }}>Nome da Categoria</th>
                <th className="p-3 text-center" style={{ width: "25%" }}>Exibição</th>
                <th className="p-3 text-right" style={{ width: "16%" }}>Ações</th>
              </tr>
            </thead>
            <tbody className="p-datatable-tbody">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    <i className="pi pi-spin pi-spinner text-2xl text-primary" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-500">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => {
                  const isFavorite = index < 3;
                  const rowClass = isFavorite 
                    ? "border-left-3 border-primary font-semibold" 
                    : "";
                  
                  return (
                    <tr
                      key={cat.id || index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border-bottom-1 border-100 transition-all duration-200 hover:bg-surface-hover ${rowClass}`}
                      style={{ cursor: "grab", userSelect: "none", ...getRowStyle(index) }}
                    >
                      <td className="p-3 text-center">
                        <i className="pi pi-bars text-400 cursor-grab" />
                      </td>
                      <td className="p-3 text-left text-800">{cat.id}</td>
                      <td className="p-3 text-left">
                        <div className="flex align-items-center gap-2">
                          <CategoryIcon iconHtml={cat.icon} size={24} className="text-900" />
                          <span className="text-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {menuStatusTemplate(cat)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-content-end gap-2">
                          <Button
                            icon="pi pi-pencil"
                            rounded
                            outlined
                            className="p-button-sm"
                            onClick={() => editCategory(cat)}
                          />
                          <Button
                            icon="pi pi-trash"
                            rounded
                            outlined
                            severity="danger"
                            className="p-button-sm"
                            onClick={() => confirmDeleteCategory(cat)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cadastrar/Editar Categoria */}
      <CategoryDialog
        visible={categoryDialog}
        category={category}
        submitted={submitted}
        onHide={hideDialog}
        onSave={saveCategory}
        setCategory={setCategory}
        toastRef={toastRef}
      />

      {/* Deletar Categoria */}
      <DeleteCategoryDialog
        visible={deleteDialog}
        categoryName={category.name}
        onHide={hideDeleteDialog}
        onConfirm={deleteCategory}
      />
    </div>
  );
}
