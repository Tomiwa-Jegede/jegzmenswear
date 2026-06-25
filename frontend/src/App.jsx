import { RouterProvider } from "react-router-dom";
import router from "./router";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AdminAuthProvider>
  );
}
export default App;
