import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { CategoryIcon } from "@/components/common/category-icon";
import CategoryService from "@/services/category-service";
import "./Categories.css";

interface ICategory {
  id?: number;
  name: string;
  icon?: string;
}

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await CategoryService.findAll();
        if (response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar as categorias.",
            life: 3000,
          });
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Falha de conexão ao carregar categorias.",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="container px-4 py-5 md:px-6 lg:px-8">
      <Toast ref={toast} />
      
      <div className="text-center mb-6">
        <h1 className="font-bold text-4xl mt-0 mb-2 text-900">Explore por Categorias</h1>
        <p className="text-600 text-lg m-0">Escolha um estilo de jogo e comece a diversão</p>
      </div>

      <div className="grid justify-content-center g-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="col-12 sm:col-6 md:col-4 lg:col-3 p-3"
            onClick={() => navigate(`/categories/${cat.id}`)}
          >
            <Card className="category-card h-full cursor-pointer flex flex-column align-items-center justify-content-center">
              <div className="category-card-icon-container mb-4 flex align-items-center justify-content-center">
                <CategoryIcon iconHtml={cat.icon} size={56} className="category-card-icon text-primary" />
              </div>
              <span className="font-bold text-xl text-900 text-center block">
                {cat.name}
              </span>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
