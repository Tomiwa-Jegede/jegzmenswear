import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";

function ArewaProductCard({ product }) {
  return (
    <a
      href={`/products/${product.slug}`}
      className="flex-shrink-0 w-36 border border-ink/10 bg-offwhite hover:border-ink/30 transition-colors"
    >
      <div className="w-full h-40 bg-cream overflow-hidden">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-ink line-clamp-2 mb-1">{product.name}</p>
        <p className="text-xs text-ink/60 mb-1">₦{product.price.toLocaleString()}</p>
        <p
          className={`text-[10px] uppercase tracking-wide mb-2 ${
            product.inStock ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </p>
        <span className="block text-center text-[10px] uppercase tracking-[0.15em] bg-ink text-offwhite py-1.5">
          View Product
        </span>
      </div>
    </a>
  );
}

function ArewaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("intro"); // "intro" | "chat"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function startChat() {
    setMode("chat");
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, I'm Arewa 👋🏽 I'm here to help you find the perfect fit",
        products: [],
      },
    ]);
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !imageFile) || sending) return;

    const pendingImagePreview = imagePreviewUrl;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, products: [], imagePreview: pendingImagePreview },
    ]);
    setInput("");
    setSending(true);

    try {
      let image;
      if (imageFile) {
        image = await fileToDataUrl(imageFile);
      }
      clearImage();

      const res = await api.post("/arewa/chat", { message: text, image });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply, products: res.data.products || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong on my end — mind trying that again?",
          products: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function closeWidget() {
    setIsOpen(false);
  }

  return (
    <>
      {!isOpen && (
             <div className="fixed bottom-24 right-6 z-40 flex items-center gap-3">
        <span className="text-xs text-ink/60 uppercase tracking-[0.15em] bg-offwhite/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-ink/10 shadow-sm whitespace-nowrap">
          Ask Arewa
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Chat with Arewa — AI shopping assistant"
            className="flex items-center justify-center w-14 h-14 rounded-full ring-1 ring-black/10 hover:scale-105 transition-transform"
          >
            <span
              className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-burgundy to-ink"
              style={{
                boxShadow:
                  "inset -3px -6px 10px rgba(0,0,0,0.5), inset 3px 4px 6px rgba(255,255,255,0.3), 0 10px 20px rgba(0,0,0,0.28), 0 3px 6px rgba(0,0,0,0.18)",
              }}
            >
              <img src="/Arewa.jpeg" alt="Arewa" className="w-full h-full object-cover" />
              <span
                className="pointer-events-none absolute rounded-full"
                style={{
                  top: "10%",
                  left: "16%",
                  width: "34%",
                  height: "24%",
                  background:
                    "radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 100%)",
                  filter: "blur(1px)",
                }}
              />
            </span>
          </button>

        </div>
      </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm hidden sm:block"
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex flex-col bg-offwhite sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-xl sm:shadow-2xl sm:border sm:border-ink/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 bg-ink text-offwhite">
            <p className="font-serif text-lg">Arewa</p>
            <button
              type="button"
              onClick={closeWidget}
              aria-label="Close"
              className="text-offwhite/70 hover:text-offwhite cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l10 10M14 4L4 14" />
              </svg>
            </button>
          </div>

          {mode === "intro" ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
              <p className="font-serif text-2xl text-ink">
                Hi, I'm Arewa 👋🏽
              </p>
              <p className="text-sm text-ink/60">
                Welcome to Jegz Menswear. What are we dressing you for today?
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                <button
                  type="button"
                  onClick={startChat}
                  className="bg-ink text-offwhite text-sm uppercase tracking-[0.15em] py-3 hover:bg-charcoal transition-colors cursor-pointer"
                >
                  Let Arewa help me
                </button>
                <button
                  type="button"
                  onClick={closeWidget}
                  className="border border-ink/20 text-ink/70 text-sm uppercase tracking-[0.15em] py-3 hover:border-ink hover:text-ink transition-colors cursor-pointer"
                >
                  I'll shop myself
                </button>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm rounded-lg ${
                        m.role === "user"
                          ? "bg-ink text-offwhite"
                          : "bg-cream text-ink"
                      }`}
                    >
                      {m.imagePreview && (
                        <img
                          src={m.imagePreview}
                          alt="Shared"
                          className="w-32 h-32 object-cover rounded mb-2"
                        />
                      )}
                      {m.content && <p className="whitespace-pre-line">{m.content}</p>}
                      {m.products?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto mt-3 -mx-1 px-1 pb-1">
                          {m.products.map((p) => (
                            <ArewaProductCard key={p.id} product={p} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-cream text-ink/50 px-4 py-2.5 rounded-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t border-ink/10 px-4 py-3">
                {imagePreviewUrl && (
                  <div className="relative w-16 h-16 mb-2">
                    <img
                      src={imagePreviewUrl}
                      alt="Selected"
                      className="w-16 h-16 object-cover rounded border border-ink/10"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      aria-label="Remove image"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-offwhite text-xs flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="arewa-image-input"
                  />
                  <label
                    htmlFor="arewa-image-input"
                    aria-label="Attach image"
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-ink/20 text-ink/60 hover:text-ink hover:border-ink transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Arewa..."
                    className="flex-1 border border-ink/20 px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!input.trim() && !imageFile)}
                    className="bg-ink text-offwhite text-xs uppercase tracking-[0.15em] px-4 py-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ArewaWidget;