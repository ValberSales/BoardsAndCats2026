import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import AdminService from "@/services/admin-service";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [totalizers, setTotalizers] = useState({
    PENDING: 0,
    PAID: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELED: 0,
  });
  const [extraStats, setExtraStats] = useState({
    totalRevenue: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const response = await AdminService.getDashboardStats();
      if (response.success && response.data) {
        const stats = response.data;
        setTotalizers({
          PENDING: stats.pendingOrders || 0,
          PAID: stats.paidOrders || 0,
          SHIPPED: stats.shippedOrders || 0,
          DELIVERED: stats.deliveredOrders || 0,
          CANCELED: stats.canceledOrders || 0,
        });
        setExtraStats({
          totalRevenue: stats.totalRevenue || 0,
          lowStockProducts: stats.lowStockProducts || 0,
        });
      }
    };
    loadStats();
  }, []);

  const cardDetails = [
    {
      title: "Pendentes",
      count: totalizers.PENDING,
      icon: "pi-clock",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
      iconColor: "bg-orange-500 text-white",
      borderColor: "border-orange-500",
      description: "Aguardando pagamento",
      status: "PENDING",
    },
    {
      title: "Pagos",
      count: totalizers.PAID,
      icon: "pi-credit-card",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      iconColor: "bg-blue-500 text-white",
      borderColor: "border-blue-500",
      description: "Prontos para envio",
      status: "PAID",
    },
    {
      title: "Enviados",
      count: totalizers.SHIPPED,
      icon: "pi-send",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      iconColor: "bg-purple-500 text-white",
      borderColor: "border-purple-500",
      description: "Em trânsito com código",
      status: "SHIPPED",
    },
    {
      title: "Entregues",
      count: totalizers.DELIVERED,
      icon: "pi-check-circle",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      iconColor: "bg-green-500 text-white",
      borderColor: "border-green-500",
      description: "Concluídos com sucesso",
      status: "DELIVERED",
    },
    {
      title: "Cancelados",
      count: totalizers.CANCELED,
      icon: "pi-times-circle",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      iconColor: "bg-red-500 text-white",
      borderColor: "border-red-500",
      description: "Cancelados ou devolvidos",
      status: "CANCELED",
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6" style={{ minHeight: "80vh" }}>
      {/* Header */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-900 m-0 flex align-items-center gap-2">
            <i className="pi pi-shield text-primary text-3xl"></i> Painel Administrativo
          </h1>
          <p className="text-600 m-0 mt-1">Gerencie os usuários e rastreie os pedidos dos clientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            label="Usuários"
            icon="pi pi-users"
            className="p-button-outlined"
            onClick={() => navigate("/admin/users")}
          />
          <Button
            label="Pedidos"
            icon="pi pi-box"
            className="p-button-outlined"
            onClick={() => navigate("/admin/orders")}
          />
          <Button
            label="Produtos"
            icon="pi pi-tags"
            className="p-button-outlined"
            onClick={() => navigate("/admin/products")}
          />
          <Button
            label="Categorias"
            icon="pi pi-list"
            className="p-button-outlined"
            onClick={() => navigate("/admin/categories")}
          />
          <Button
            label="Carrossel"
            icon="pi pi-images"
            className="p-button-outlined"
            onClick={() => navigate("/admin/carousel")}
          />
          <Button
            label="Logs"
            icon="pi pi-terminal"
            onClick={() => navigate("/admin/logs")}
          />
        </div>
      </div>

      {/* Overview Cards (Revenue & Stock Alerts) */}
      <div className="grid mb-5">
        <div className="col-12 md:col-6 p-2">
          <div className="surface-card shadow-2 border-round border-left-4 border-green-500 p-4 flex align-items-center justify-content-between">
            <div>
              <span className="block text-500 font-bold uppercase text-xs tracking-wider mb-2">Receita Total</span>
              <div className="text-4xl font-bold text-900">
                {extraStats.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-500 text-xs m-0 mt-1">Exclui pedidos cancelados</p>
            </div>
            <div className="flex align-items-center justify-content-center border-round w-4rem h-4rem bg-green-100 text-green-700">
              <i className="pi pi-dollar text-3xl"></i>
            </div>
          </div>
        </div>        <div className="col-12 md:col-6 p-2">
          <div className="surface-card shadow-2 border-round border-left-4 border-yellow-500 p-4 flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => navigate("/admin/products?filter=LOW_STOCK")}>
            <div>
              <span className="block text-500 font-bold uppercase text-xs tracking-wider mb-2">Produtos com Estoque Baixo</span>
              <div className="text-4xl font-bold text-900">{extraStats.lowStockProducts}</div>
              <p className="text-500 text-xs m-0 mt-1">Produtos com 5 ou menos unidades (Clique para ver)</p>
            </div>
            <div className="flex align-items-center justify-content-center border-round w-4rem h-4rem bg-yellow-100 text-yellow-700">
              <i className="pi pi-exclamation-triangle text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Totalizer Cards */}
      <div className="grid">
        {cardDetails.map((card, idx) => (
          <div key={idx} className="col-12 sm:col-6 lg:col-4 xl:col p-2">
            <div className={`surface-card shadow-2 hover:shadow-4 transition-all transition-duration-200 border-round h-full border-top-3 ${card.borderColor} p-4 flex flex-column justify-content-between`} style={{ borderTopWidth: '4px' }}>
              <div>
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="block text-500 font-bold uppercase text-xs tracking-wider">{card.title}</span>
                  <div className={`flex align-items-center justify-content-center border-round w-3rem h-3rem ${card.bgColor} ${card.textColor}`}>
                    <i className={`pi ${card.icon} text-2xl`}></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-900 mb-2">{card.count}</div>
                <p className="text-500 text-xs m-0 mb-4">{card.description}</p>
              </div>
              <div className="pt-3 border-top-1 surface-border flex align-items-center justify-content-between mt-auto">
                <Button 
                  label="Ver todos" 
                  icon="pi pi-arrow-right" 
                  iconPos="right" 
                  link 
                  className="p-0 text-sm font-semibold"
                  onClick={() => navigate(`/admin/orders?status=${card.status}`)} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcuts/Welcome section */}
      <div className="grid mt-6">
        <div className="col-12 md:col-6 p-2">
          <div className="surface-card p-5 shadow-2 border-round h-full flex flex-column justify-content-between">
            <div>
              <div className="flex align-items-center gap-3 mb-4">
                <div className="bg-primary-100 text-primary-700 border-circle flex align-items-center justify-content-center w-3rem h-3rem">
                  <i className="pi pi-users text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-900 m-0">Gestão de Usuários</h2>
                  <p className="text-600 m-0 text-sm">Visualize e gerencie as contas cadastradas na plataforma.</p>
                </div>
              </div>
              <ul className="list-none p-0 m-0 mb-4 text-700 text-sm flex flex-column gap-2">
                <li><i className="pi pi-check text-green-500 mr-2"></i> Ativar ou desativar acessos de usuários.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Alterar permissões entre cliente padrão e administrador.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Pesquisa rápida de usuários por nome ou email.</li>
              </ul>
            </div>
            <Button
              label="Acessar Gestão de Usuários"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="w-full"
              onClick={() => navigate("/admin/users")}
            />
          </div>
        </div>

        <div className="col-12 md:col-6 p-2">
          <div className="surface-card p-5 shadow-2 border-round h-full flex flex-column justify-content-between">
            <div>
              <div className="flex align-items-center gap-3 mb-4">
                <div className="bg-primary-100 text-primary-700 border-circle flex align-items-center justify-content-center w-3rem h-3rem">
                  <i className="pi pi-box text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-900 m-0">Acompanhamento de Pedidos</h2>
                  <p className="text-600 m-0 text-sm">Controle de fluxo de envio e faturamento dos pedidos.</p>
                </div>
              </div>
              <ul className="list-none p-0 m-0 mb-4 text-700 text-sm flex flex-column gap-2">
                <li><i className="pi pi-check text-green-500 mr-2"></i> Atualização de status em tempo real (Pago, Enviado, Entregue).</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Upload de Nota Fiscal (PDF) para envios.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Inserção de código de rastreamento e anexos de recibos.</li>
              </ul>
            </div>
            <Button
              label="Acessar Rastreio de Pedidos"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="w-full"
              onClick={() => navigate("/admin/orders")}
            />
          </div>
        </div>

        <div className="col-12 md:col-6 p-2">
          <div className="surface-card p-5 shadow-2 border-round h-full flex flex-column justify-content-between">
            <div>
              <div className="flex align-items-center gap-3 mb-4">
                <div className="bg-primary-100 text-primary-700 border-circle flex align-items-center justify-content-center w-3rem h-3rem">
                  <i className="pi pi-tags text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-900 m-0">Catálogo e Categorias</h2>
                  <p className="text-600 m-0 text-sm">Gerencie o portfólio de produtos e suas divisões de categorias.</p>
                </div>
              </div>
              <ul className="list-none p-0 m-0 mb-4 text-700 text-sm flex flex-column gap-2">
                <li><i className="pi pi-check text-green-500 mr-2"></i> Criar, editar ou remover produtos do catálogo.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Adicionar imagem de capa e galeria secundária de imagens via MinIO.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> CRUD completo de Categorias.</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                label="Produtos"
                icon="pi pi-tags"
                className="w-full p-button-outlined"
                onClick={() => navigate("/admin/products")}
              />
              <Button
                label="Categorias"
                icon="pi pi-list"
                className="w-full"
                onClick={() => navigate("/admin/categories")}
              />
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 p-2">
          <div className="surface-card p-5 shadow-2 border-round h-full flex flex-column justify-content-between">
            <div>
              <div className="flex align-items-center gap-3 mb-4">
                <div className="bg-primary-100 text-primary-700 border-circle flex align-items-center justify-content-center w-3rem h-3rem">
                  <i className="pi pi-images text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-900 m-0">Banners do Carrossel</h2>
                  <p className="text-600 m-0 text-sm">Controle os destaques visuais exibidos na página inicial.</p>
                </div>
              </div>
              <ul className="list-none p-0 m-0 mb-4 text-700 text-sm flex flex-column gap-2">
                <li><i className="pi pi-check text-green-500 mr-2"></i> Cadastrar novos banners promocionais.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Vincular banners a produtos específicos do catálogo.</li>
                <li><i className="pi pi-check text-green-500 mr-2"></i> Carregar imagens de banners diretamente para o MinIO.</li>
              </ul>
            </div>
            <Button
              label="Gerenciar Carrossel"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="w-full"
              onClick={() => navigate("/admin/carousel")}
            />
          </div>
        </div>

        {/* Card de Logs (Largura Total na Base) */}
        <div className="col-12 p-2">
          <div className="surface-card p-5 shadow-2 border-round flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-4">
            <div className="flex align-items-center gap-4">
              <div className="bg-primary-100 text-primary-700 border-circle flex align-items-center justify-content-center w-3.5rem h-3.5rem flex-shrink-0" style={{ width: '3.5rem', height: '3.5rem' }}>
                <i className="pi pi-terminal text-3xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-900 m-0">Logs e Auditoria do Sistema</h2>
                <p className="text-600 m-0 text-sm mt-1">Visualize logs do servidor em tempo real para acompanhar envio de e-mails, auditorias de status e exceções.</p>
              </div>
            </div>
            <Button
              label="Visualizar Logs do Servidor"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="w-full md:w-auto flex-shrink-0"
              onClick={() => navigate("/admin/logs")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
