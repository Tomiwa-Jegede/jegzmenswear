import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useToast } from "../../context/ToastContext";
import Skeleton from "../../components/ui/Skeleton";

const FILTERS = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];

function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [expandedId, setExpandedId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    api
      .get("/orders", { params: { status: filter } })
      .then((res) => setOrders(res.data))
      .catch(() => showToast("Unable to load orders. Please try again."))
      .finally(() => setLoading(false));
  }, [filter, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId, orderStatus) {
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus });
      showToast(`Order marked as ${orderStatus.toLowerCase()}.`, "success");
      loadOrders();
    } catch (err) {
      showToast("Could not update order status. Please try again.");
    }
  }

  return (
    <div className="px-6 py-12 max-w-6xl">
      <Link
        to="/admin"
        className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Back to Admin
      </Link>
      <h1 className="font-serif text-3xl text-ink mb-8">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
              filter === f
                ? "bg-ink text-offwhite border-ink"
                : "border-ink/20 text-ink/60 hover:border-ink"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink/50">No {filter.toLowerCase()} orders.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.15em] text-ink/50 border-b border-ink/10">
                <th className="py-3 pr-4">Order ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Address</th>
                <th className="py-3 pr-4">Products</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-ink/10 align-top">
                  <td className="py-3 pr-4 text-ink/70">{order.id.slice(0, 8)}</td>
                  <td className="py-3 pr-4 text-ink">{order.customerName}</td>
                  <td className="py-3 pr-4 text-ink/70">{order.phoneNumber}</td>
                  <td className="py-3 pr-4 text-ink/70 max-w-[180px]">
                    {order.fulfillmentMethod === "PICKUP" ? (
                      <span className="text-xs uppercase tracking-[0.1em] text-ink/50">
                        Pickup
                      </span>
                    ) : (
                      order.deliveryAddress
                    )}
                  </td>
                  <td className="py-3 pr-4 text-ink/70">
                    {expandedId === order.id ? (
                      <ul className="space-y-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex gap-3 items-start">
                            {item.product?.images?.[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.images[0].altText || item.product.name}
                                onClick={() => setLightboxImage(item.product.images[0])}
                                className="w-12 h-12 object-cover border border-ink/10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                              />
                            )}
                            <div>
                            <p>× {item.quantity}</p>
                            {item.measurements && (
                              <div className="mt-1 pl-3 border-l-2 border-ink/10 text-xs text-ink/60 space-y-0.5">
                                <p className="uppercase tracking-[0.1em] text-ink/40 mb-1">
                                  Measurements
                                </p>
                                <p>
                                  Shirt — Length: {item.measurements.shirtLength}, Back:{" "}
                                  {item.measurements.shirtBack}, Sleeve:{" "}
                                  {item.measurements.shirtSleeve}, Body:{" "}
                                  {item.measurements.shirtBody}, Chest:{" "}
                                  {item.measurements.shirtChest}, Neck:{" "}
                                  {item.measurements.shirtNeck}, Armpits:{" "}
                                  {item.measurements.shirtArmpits}
                                </p>
                                <p>
                                  Trouser — Length: {item.measurements.trouserLength}, Waist:{" "}
                                  {item.measurements.trouserWaist}, Hips:{" "}
                                  {item.measurements.trouserHips}, Laps:{" "}
                                  {item.measurements.trouserLaps}
                                </p>
                              </div>
                            )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <button
                        onClick={() => setExpandedId(order.id)}
                        className="text-xs uppercase tracking-[0.15em] text-ink/60 hover:text-ink underline cursor-pointer"
                      >
                        View Details ({order.items.length})
                      </button>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-ink">
                    ₦{Number(order.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs uppercase tracking-[0.1em] ${
                        order.paymentStatus === "PAID"
                          ? "text-emerald-700"
                          : order.paymentStatus === "FAILED"
                            ? "text-red-600"
                            : "text-ink/50"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs uppercase tracking-[0.1em] text-ink/70">
                    {order.orderStatus}
                  </td>
                  <td className="py-3 pr-4 text-ink/50 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-1">
                      {order.orderStatus !== "PROCESSING" &&
                        order.orderStatus !== "DELIVERED" &&
                        order.orderStatus !== "CANCELLED" && (
                          <button
                            onClick={() => updateStatus(order.id, "PROCESSING")}
                            className="text-xs uppercase tracking-[0.1em] text-ink/60 hover:text-ink text-left cursor-pointer"
                          >
                            Mark Processing
                          </button>
                        )}
                      {order.orderStatus !== "DELIVERED" &&
                        order.orderStatus !== "CANCELLED" && (
                          <button
                            onClick={() => updateStatus(order.id, "DELIVERED")}
                            className="text-xs uppercase tracking-[0.1em] text-ink/60 hover:text-ink text-left cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      {order.orderStatus !== "DELIVERED" &&
                        order.orderStatus !== "CANCELLED" && (
                          <button
                            onClick={() => updateStatus(order.id, "CANCELLED")}
                            className="text-xs uppercase tracking-[0.1em] text-red-600 hover:text-red-800 text-left cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 cursor-pointer"
        >
          <img
            src={lightboxImage.url}
            alt={lightboxImage.altText || "Product image"}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default AdminOrders;