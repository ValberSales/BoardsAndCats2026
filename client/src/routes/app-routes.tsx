import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { ProductDetailPage } from "@/pages/product-detail";
import { CategoryPage } from "@/pages/category"; 
import { CategoriesPage } from "@/pages/categories";
import { PromotionsPage } from "@/pages/promotions";
import { AboutPage } from "@/pages/institutional/about";
import { LocationPage } from "@/pages/institutional/location";
import { ContactPage } from "@/pages/institutional/contact";
import { RequireAuth } from "@/components/common/require-auth";
import { ProfilePage } from "@/pages/profile";
import { OrdersPage } from "@/pages/orders";
import { CartPage } from "@/pages/cart";
import { CheckoutPage } from "@/pages/checkout";
import { WishlistPage } from "@/pages/wishlist";
import { SearchResultsPage } from "@/pages/search-results";
import { ScrollToTop } from "@/components/common/scroll-to-top";

// Admin Imports
import { RequireAdmin } from "@/components/common/require-admin";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminOrdersPage } from "@/pages/admin/orders";
import { AdminOrderDetailPage } from "@/pages/admin/orders/detail";
import { AdminProductsPage } from "@/pages/admin/products";
import { AdminCategoriesPage } from "@/pages/admin/categories";
import { AdminCarouselPage } from "@/pages/admin/carousel";
import { AdminLogsPage } from "@/pages/admin/logs";

export function AppRoutes() {
  return (
    <>
      
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Rotas Protegidas */}
          <Route element={<RequireAuth />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
          </Route>

          {/* Rotas Protegidas de Admin */}
          <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/carousel" element={<AdminCarouselPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}