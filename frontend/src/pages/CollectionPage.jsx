import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/axios";
import Skeleton from "../components/ui/Skeleton";

function getCropTransform({ cropX = 0, cropY = 0, cropWidth = 100, cropHeight = 100 } = {}) {
  const scaleX = 100 / cropWidth;
  const scaleY = 100 / cropHeight;
  return {
    transformOrigin: "top left",
    transform: `translate(${-cropX * scaleX}%, ${-cropY * scaleY}%) scale(${scaleX}, ${scaleY})`,
  };
}


function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    api
      .get(`/collections/${slug}`)
      .then((res) => setCollection(res.data))
      .catch(console.error);
  }, [slug]);

  if (!collection) {
  return (
    <div className="px-6 py-12 animate-pulse">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-4 w-96 max-w-full mb-10" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="bg-ink/10 aspect-[3/4] border border-ink/10 mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="px-6 py-12">
      <h1 className="font-serif text-4xl text-ink mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-ink/60 mb-10 max-w-xl">{collection.description}</p>
      )}
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {collection.products.map((p) => (
          <li key={p.id}>
            <Link to={`/products/${p.slug}`} className="group block">
              <div className="bg-cream aspect-[3/4] overflow-hidden mb-3 relative">
                {p.images[0] && (
                  <>
                    <FadeImage
                      src={p.images[0].url}
                      alt={p.images[0].altText || p.name}
                      className="absolute inset-0 h-full w-full sm:hidden group-hover:scale-105 transition-transform duration-500"
                      style={getCropTransform({
                        cropX: p.images[0].mobileCropX,
                        cropY: p.images[0].mobileCropY,
                        cropWidth: p.images[0].mobileCropWidth,
                        cropHeight: p.images[0].mobileCropHeight,
                      })}
                    />
                    <FadeImage
                      src={p.images[0].url}
                      alt={p.images[0].altText || p.name}
                      className="absolute inset-0 h-full w-full hidden sm:block group-hover:scale-105 transition-transform duration-500"
                      style={getCropTransform({
                        cropX: p.images[0].desktopCropX,
                        cropY: p.images[0].desktopCropY,
                        cropWidth: p.images[0].desktopCropWidth,
                        cropHeight: p.images[0].desktopCropHeight,
                      })}
                    />
                  </>
                )}
              </div>
              <p className="text-ink text-sm">{p.name}</p>
              <p className="text-ink/50 text-sm">₦{Number(p.price).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CollectionPage;
