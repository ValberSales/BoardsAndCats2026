import { useEffect, useState, useRef } from "react";
import type { IProduct } from  "@/types/product";
import ProductService from "@/services/product-service";
import { Toast } from "primereact/toast";
import { CategoryShelf } from "@/components/product/category-shelf";
import { BannerCarousel } from "@/components/home/banner-carousel"; // <--- Importe aqui

export const HomePage = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await ProductService.findAll();
      if (response.status === 200 && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível carregar os produtos." });
      }
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Ocorreu um erro ao buscar os dados." });
    } finally {
      setLoading(false);
    }
  };

  const visibleProducts = products.filter(p => p.visible !== false);
  const boardGames = visibleProducts.filter(p => p.category.name === "Jogos de Tabuleiro");
  const cardGames = visibleProducts.filter(p => p.category.name === "Card Games");
  const acessorios = visibleProducts.filter(p => p.category.name === "Acessórios");
  const promoProducts = visibleProducts.filter(p => p.promo === true);

  return (
    <div> 
      <Toast ref={toast} />

      {loading && (
          <div className="text-center p-6">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          </div>
      )}
      
      {!loading && (
        <div className="container mx-auto px-4 py-4">
            
            <BannerCarousel />

            <CategoryShelf title="🔥 Ofertas Especiais" products={promoProducts} viewAllLink="/promotions"/>
            <CategoryShelf title="Jogos de Tabuleiro" products={boardGames} viewAllLink="/categories/1"/>
            <CategoryShelf title="Card Games" products={cardGames} viewAllLink="/categories/2"/>
            <CategoryShelf title="Acessórios" products={acessorios} viewAllLink="/categories/3"/>
        </div>
      )}
    </div>
  );
};