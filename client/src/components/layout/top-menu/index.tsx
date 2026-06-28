import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/lib/axios";
import { useAuth } from "@/context/hooks/use-auth";
import { CartContext } from "@/context/CartContext"; 

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar";
import { Sidebar } from "primereact/sidebar";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge"; 

import { LoginForm } from "@/components/auth/login-form";
import { HappyIcon } from "@/components/common/icons/HappyIcon";
import { PromoIcon } from "@/components/common/icons/PromoIcon";
import { CategoryIcon } from "@/components/common/category-icon";
import CategoryService from "@/services/category-service";

import "./TopMenu.css";

interface ICategory {
  id?: number;
  name: string;
  icon?: string;
}

const TopMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, authenticatedUser, handleLogout } = useAuth();
  const { items } = useContext(CartContext); 
  
  const isCategoriesActive = () => {
    if (location.pathname === "/categories") {
      return true;
    }
    const match = location.pathname.match(/^\/categories\/(\d+)$/);
    if (match) {
      const catId = parseInt(match[1], 10);
      const favs = Array.isArray(favoriteIds) ? favoriteIds.map(Number) : [];
      return !favs.includes(catId);
    }
    return false;
  };
  
  const searchPanel = useRef<OverlayPanel>(null);
  const loginPanel = useRef<OverlayPanel>(null);
  const tabletControlPanel = useRef<OverlayPanel>(null); 
  const userMenu = useRef<Menu>(null);
  
  const [visibleSidebar, setVisibleSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("favoriteCategories");
    return saved ? JSON.parse(saved) : [1, 2, 3];
  });
  const [categoryOrder, setCategoryOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem("categoryOrder");
    return saved ? JSON.parse(saved) : [];
  });

  const categoriesPanel = useRef<OverlayPanel>(null);

  const loadFavorites = () => {
    const savedFavs = localStorage.getItem("favoriteCategories");
    setFavoriteIds(savedFavs ? JSON.parse(savedFavs) : [1, 2, 3]);

    const savedOrder = localStorage.getItem("categoryOrder");
    setCategoryOrder(savedOrder ? JSON.parse(savedOrder) : []);
  };

  useEffect(() => {
    const loadCategories = async () => {
      const response = await CategoryService.findAll();
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    };
    loadCategories();
    loadFavorites();

    const handleFavChange = () => {
      loadFavorites();
      loadCategories();
    };

    window.addEventListener("favoritesChanged", handleFavChange);
    return () => {
      window.removeEventListener("favoritesChanged", handleFavChange);
    };
  }, []);

  const getCategoryIcon = (_categoryName: string, categoryId?: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return <CategoryIcon iconHtml={cat?.icon} size={28} className="nav-icon-svg" />;
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement;
    if (themeLink) {
      const currentUrl = themeLink.getAttribute('href');
      if (currentUrl) {
          let newUrl = currentUrl;
          if (darkMode && currentUrl.includes('light')) {
              newUrl = currentUrl.replace('light', 'dark');
          } else if (!darkMode && currentUrl.includes('dark')) {
              newUrl = currentUrl.replace('dark', 'light');
          }
          if (newUrl !== currentUrl) {
              themeLink.href = newUrl;
          }
      }
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }

    if (darkMode) {
      document.documentElement.classList.add("layout-dark");
      document.documentElement.classList.remove("layout-light");
    } else {
      document.documentElement.classList.add("layout-light");
      document.documentElement.classList.remove("layout-dark");
    }
  }, [darkMode]);

  // 2. Função para realizar a busca
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`); 
      searchPanel.current?.hide();
      setSearchTerm(""); 
    }
  };

  // 3. Capturar o "Enter"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isAdmin = authenticatedUser?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN');

  const userMenuItems = [
    {
        label: 'Minha Conta',
        items: [
            ...(isAdmin ? [{ label: 'Painel Admin', icon: 'pi pi-shield', command: () => navigate('/admin/dashboard') }] : []),
            { label: 'Meu Perfil', icon: 'pi pi-user', command: () => navigate('/profile') },
            { label: 'Meus Pedidos', icon: 'pi pi-box', command: () => navigate('/orders') },
            { label: 'Lista de Desejos', icon: 'pi pi-heart', command: () => navigate('/wishlist') },
        ]
    },
    {
        label: 'Ações',
        items: [
            { 
              label: darkMode ? 'Modo Claro' : 'Modo Escuro', 
              icon: darkMode ? 'pi pi-sun' : 'pi pi-moon', 
              command: () => setDarkMode(!darkMode) 
            },
            { label: 'Sair', icon: 'pi pi-sign-out', command: () => { handleLogout(); navigate('/'); } }
        ]
    }
  ];

  const renderTabletPopupContent = () => (
      <div className="flex flex-column gap-2">
          {authenticated ? (
              <div className="flex flex-column gap-1">
                  <div className="flex align-items-center gap-2 mb-2 px-2 text-900">
                      <Avatar icon="pi pi-user" shape="circle" />
                      <span className="font-bold text-lg">{authenticatedUser?.displayName?.split(' ')[0]}</span>
                  </div>
                  {isAdmin && (
                      <Button label="Painel Admin" icon="pi pi-shield" link className="text-left pl-2 py-2 font-bold" onClick={() => { navigate('/admin/dashboard'); tabletControlPanel.current?.hide(); }} />
                  )}
                  <Button label="Meu Perfil" icon="pi pi-user" link className="text-left pl-2 py-2" onClick={() => { navigate('/profile'); tabletControlPanel.current?.hide(); }} />
                  <Button label="Meus Pedidos" icon="pi pi-box" link className="text-left pl-2 py-2" onClick={() => { navigate('/orders'); tabletControlPanel.current?.hide(); }} />
                  <Button label="Lista de Desejos" icon="pi pi-heart" link className="text-left pl-2 py-2" onClick={() => { navigate('/wishlist'); tabletControlPanel.current?.hide(); }} />
                  
                  <Button label="Sair" icon="pi pi-sign-out" severity="danger" text className="text-left pl-2 py-2" onClick={() => { handleLogout(); tabletControlPanel.current?.hide(); navigate('/'); }} />
              </div>
          ) : (
              <div className="px-1 pt-1">
                  <h3 className="text-center m-0 mb-3 text-900">Bem-vindo</h3>
                  <LoginForm onSuccess={() => tabletControlPanel.current?.hide()} showRegisterLink={true} />
              </div>
          )}
          <Divider className="my-2" />
          <div className="flex justify-content-center gap-4 pb-1">
              <Button icon={`pi ${darkMode ? 'pi-sun' : 'pi-moon'}`} rounded text severity="secondary" aria-label="Alternar Tema" size="large" onClick={() => setDarkMode(!darkMode)} tooltip={darkMode ? "Modo Claro" : "Modo Escuro"} tooltipOptions={{ position: 'bottom' }} />
              
              <div className="relative">
                  <Button icon="pi pi-shopping-cart" rounded text severity="secondary" aria-label="Carrinho" size="large" onClick={() => { navigate("/cart"); tabletControlPanel.current?.hide(); }} />
                  {items.length > 0 && (
                      <Badge value={items.length} severity="danger" className="absolute" style={{ top: '0', right: '0', minWidth: '1.2rem', height: '1.2rem', lineHeight: '1.2rem', fontSize: '0.75rem' }}></Badge>
                  )}
              </div>
          </div>
      </div>
  );

  const renderNavLinks = (isSidebar: boolean = false) => {
    const favorites = categories.filter(cat => cat.id && favoriteIds.includes(cat.id));
    const displayedCategories = [...favorites].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.id!);
      const indexB = categoryOrder.indexOf(b.id!);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return (
      <>
          <NavLink to="/" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} onClick={() => isSidebar && setVisibleSidebar(false)}>
              <HappyIcon size={28} className="nav-icon-svg" />
              <span>Início</span>
          </NavLink>
          <NavLink to="/promotions" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} onClick={() => isSidebar && setVisibleSidebar(false)}>
              <PromoIcon size={28} className="nav-icon-svg" />
              <span>Promoções</span>
          </NavLink>
          {displayedCategories.map((cat) => (
            <NavLink 
              key={cat.id} 
              to={`/categories/${cat.id}`} 
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} 
              onClick={() => isSidebar && setVisibleSidebar(false)}
            >
              {getCategoryIcon(cat.name, cat.id)}
              <span>{cat.name}</span>
            </NavLink>
          ))}
          <NavLink 
            to="/categories" 
            className={() => `nav-link-item ${isCategoriesActive() ? 'active' : ''}`} 
            onClick={() => isSidebar && setVisibleSidebar(false)}
          >
              <i className="pi pi-th-large text-2xl nav-icon-svg mr-2 flex align-items-center" style={{ fontSize: '24px' }}></i>
              <span>Categorias</span>
          </NavLink>
      </>
    );
  };

  return (
    <nav className="top-menu-container px-4 py-2 flex align-items-center justify-content-between relative">
      
      {/* --- 1. SIDEBAR (Celular) --- */}
      <Sidebar 
        visible={visibleSidebar} 
        onHide={() => setVisibleSidebar(false)} 
        className="w-20rem"
        showCloseIcon={false} 
      >
          <div className="flex flex-column h-full">
              <div className="flex align-items-center justify-content-between mb-2">
                  <Button 
                      icon={`pi ${darkMode ? 'pi-sun' : 'pi-moon'}`} 
                      rounded text severity="secondary" aria-label="Alternar Tema"
                      onClick={() => setDarkMode(!darkMode)}
                  />
                  <Button 
                      icon="pi pi-times" 
                      rounded text severity="secondary" aria-label="Fechar"
                      onClick={() => setVisibleSidebar(false)}
                  />
              </div>

              <div className="flex flex-column gap-2">
                  <div className="text-center mb-3">
                    <img src={`${API_BASE_URL}/images/logow.webp`} alt="Logo" style={{ height: '60px' }} />
                  </div>
                  
                  <div className="flex flex-column gap-2">{renderNavLinks(true)}</div>
                  
                  <Divider />

                  <div className="flex flex-column gap-3">
                      <Button 
                          label={`Carrinho ${items.length > 0 ? `(${items.length})` : ''}`}
                          icon="pi pi-shopping-cart" 
                          outlined 
                          onClick={() => { navigate("/cart"); setVisibleSidebar(false); }} 
                          className="w-full"
                      >
                          {items.length > 0 && <Badge value={items.length} severity="danger" className="ml-2"></Badge>}
                      </Button>
                      
                      {!authenticated && (
                          <div className="p-3 text-center surface-100 border-round">
                               <p className="m-0 mb-2 font-bold">Acesse sua conta</p>
                               <Button 
                                    label="Login / Cadastro" 
                                    onClick={() => { setVisibleSidebar(false); navigate('/login'); }} 
                                    className="w-full" 
                               />
                          </div>
                      )}
                  </div>
              </div>

              {authenticated && (
                  <div className="mt-auto pt-3">
                      <Divider />
                      <div className="flex flex-column gap-2 surface-100 p-3 border-round">
                          <div className="flex align-items-center gap-2 mb-2">
                              <Avatar icon="pi pi-user" shape="circle" />
                              <span className="font-bold">{authenticatedUser?.displayName}</span>
                          </div>
                          {isAdmin && (
                              <Button label="Painel Admin" icon="pi pi-shield" link onClick={() => { navigate('/admin/dashboard'); setVisibleSidebar(false); }} className="text-left pl-0 font-bold" />
                          )}
                          <Button label="Meu Perfil" icon="pi pi-user" link onClick={() => { navigate('/profile'); setVisibleSidebar(false); }} className="text-left pl-0" />
                          <Button label="Meus Pedidos" icon="pi pi-box" link onClick={() => { navigate('/orders'); setVisibleSidebar(false); }} className="text-left pl-0" />
                          <Button label="Lista de Desejos" icon="pi pi-heart" link onClick={() => { navigate('/wishlist'); setVisibleSidebar(false); }} className="text-left pl-0" />

                          <Button label="Sair" icon="pi pi-sign-out" severity="danger" text onClick={() => { handleLogout(); setVisibleSidebar(false); navigate('/'); }} className="text-left pl-0" />
                      </div>
                  </div>
              )}

          </div>
      </Sidebar>

      {/* --- 2. ESQUERDA --- */}
      <div className="flex align-items-center gap-2">
          <Button 
            icon="pi pi-bars" text rounded size="large"
            className="d-mobile text-900" 
            onClick={() => setVisibleSidebar(true)} 
          />
          
          <div className="d-tablet-desktop align-items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={`${API_BASE_URL}/images/logow.webp`} alt="Boards and Cats" className="logo-img mr-2" />
          </div>
      </div>

      {/* --- 3. CENTRO --- */}
      <div 
        className="d-mobile logo-mobile-center cursor-pointer" 
        onClick={() => navigate("/")}
      >
          <img src={`${API_BASE_URL}/images/logow.webp`} alt="Logo" className="logo-img" style={{ height: '50px', width: 'auto' }} />
      </div>

      <div className="d-tablet-desktop align-items-center gap-1">
        {renderNavLinks(false)}
      </div>

      {/* --- 4. DIREITA --- */}
      <div className="flex align-items-center gap-2 md:gap-3">
        {/* --- CAMPO DE BUSCA --- */}
        <Button 
            icon="pi pi-search" rounded text severity="secondary" aria-label="Buscar" 
            onClick={(e) => {
              searchPanel.current?.toggle(e);
              setTimeout(() => {
                const input = document.getElementById('search-input');
                if (input) input.focus();
              }, 100);
            }}
        />
        <OverlayPanel ref={searchPanel} className="w-20rem">
            <div className="p-inputgroup">
                <InputText 
                  id="search-input"
                  placeholder="Buscar produtos..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                />
                <Button icon="pi pi-search" onClick={handleSearch} /> 
            </div>
        </OverlayPanel>

        <div className="d-tablet">
            <Button icon="pi pi-ellipsis-v" rounded text severity="secondary" onClick={(e) => tabletControlPanel.current?.toggle(e)} />
            <OverlayPanel ref={tabletControlPanel} className="w-22rem">
                {renderTabletPopupContent()}
            </OverlayPanel>
        </div>

        <div className="d-desktop align-items-center gap-2">
            {/* Carrinho com Badge (Desktop) */}
            <div className="relative mr-2" style={{ cursor: 'pointer' }} onClick={() => navigate("/cart")}>
                <Button icon="pi pi-shopping-cart" rounded text severity="secondary" aria-label="Carrinho" />
                {items.length > 0 && (
                    <Badge 
                        value={items.length} 
                        severity="danger" 
                        className="absolute" 
                        style={{ 
                            top: '2px', 
                            right: '2px', 
                            minWidth: '1.2rem', 
                            height: '1.2rem', 
                            lineHeight: '1.2rem',
                            fontSize: '0.75rem',
                            padding: 0 
                        }}
                    ></Badge>
                )}
            </div>

            {authenticated ? (
                <>
                    <Menu model={userMenuItems} popup ref={userMenu} id="popup_menu_user" />
                    <div className="cursor-pointer flex align-items-center gap-2 hover:surface-100 p-1 border-round transition-duration-200" onClick={(event) => userMenu.current?.toggle(event)}>
                        <Avatar icon="pi pi-user" shape="circle" className="surface-200 text-700" />
                        <span className="font-semibold text-sm text-900">{authenticatedUser?.displayName?.split(' ')[0]}</span>
                        <i className="pi pi-angle-down text-sm text-600"></i>
                    </div>
                </>
            ) : (
                <>
                    <Button icon="pi pi-user" rounded text severity="secondary" onClick={(e) => loginPanel.current?.toggle(e)} />
                    <OverlayPanel ref={loginPanel} className="w-20rem">
                        <div className="flex flex-column gap-3">
                            <div className="flex justify-content-between align-items-center">
                                <h3 className="m-0">Bem-vindo</h3>
                                <Button 
                                  icon={`pi ${darkMode ? 'pi-sun' : 'pi-moon'}`} 
                                  rounded 
                                  text 
                                  severity="secondary" 
                                  onClick={() => setDarkMode(!darkMode)} 
                                  aria-label="Alternar Tema"
                                />
                            </div>
                            <LoginForm onSuccess={() => loginPanel.current?.hide()} showRegisterLink={true} />
                        </div>
                    </OverlayPanel>
                </>
            )}
        </div>
      </div>
    </nav>
  );
};

export default TopMenu;