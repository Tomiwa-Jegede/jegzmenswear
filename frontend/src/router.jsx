import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import RouteErrorBoundary from "./components/RouteErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Shop = lazy(() => import("./pages/Shop"));
const Info = lazy(() => import("./pages/Info"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminHeroImages = lazy(() => import("./pages/admin/AdminHeroImages"));
const AdminCampaignImages = lazy(() => import("./pages/admin/AdminCampaignImages"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminSiteContent = lazy(() => import("./pages/admin/AdminSiteContent"));
const AdminMusic = lazy(() => import("./pages/admin/AdminMusic"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "collections/:slug", element: <CollectionPage /> },
      { path: "products/:slug", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <Checkout /> },
      { path: "order-success", element: <OrderSuccess /> },
      { path: "shop", element: <Shop /> },
      { path: "info", element: <Info /> },
      { path: "admin/login", element: <AdminLogin /> },
      {
        path: "admin",
        element: <ProtectedAdminRoute />,
        children: [
          { index: true, element: <AdminHome /> },
          { path: "hero", element: <AdminHeroImages /> },
          { path: "campaign", element: <AdminCampaignImages /> },
          { path: "products", element: <AdminProducts /> },
          { path: "collections", element: <AdminCollections /> },
          { path: "site-content", element: <AdminSiteContent /> },
          { path: "music", element: <AdminMusic /> },
          { path: "orders", element: <AdminOrders /> },
        ],
      },
    ],
  },
]);
export default router;
