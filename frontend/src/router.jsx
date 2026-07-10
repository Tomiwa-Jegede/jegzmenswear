import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import CollectionPage from "./pages/CollectionPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Shop from "./pages/Shop";
import Info from "./pages/Info";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminHome from "./pages/admin/AdminHome";
import AdminHeroImages from "./pages/admin/AdminHeroImages";
import AdminCampaignImages from "./pages/admin/AdminCampaignImages";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminSiteContent from "./pages/admin/AdminSiteContent";
import AdminMusic from "./pages/admin/AdminMusic";
import AdminOrders from "./pages/admin/AdminOrders";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
