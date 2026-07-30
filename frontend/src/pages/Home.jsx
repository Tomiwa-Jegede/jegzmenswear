import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import api from "../lib/axios";
import Hero from "../components/Hero";
import FeaturedCollections from "../components/FeaturedCollections";
import RugbyPoloSpotlight from "../components/Spotlight";
import CampaignEditorial from "../components/CampaignEditorial";
import BrandPhilosophy from "../components/BrandPhilosophy";


function Home() {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    api
      .get("/collections")
      .then((res) => setCollections(res.data))
      .catch(console.error);
  }, []);

  return (
    <>
      <Helmet>
        <title>Jegzmenswear | Men's Fashion Nigeria | Trendy Streetwear & Premium Fits</title>
        <meta
          name="description"
          content="Shop premium men's fashion at Jegzmenswear — hoodies, jeans, leather jackets, sneakers, bags, caps, watches & full fits. Fast nationwide delivery."
        />
        <link rel="canonical" href="https://jegzmenswear.store/" />
      </Helmet>
      <Hero />
      {/* <FeaturedCollections collections={collections} /> */}
      {/* <RugbyPoloSpotlight /> */}
      {/* <CampaignEditorial /> */}
      {/* <BrandPhilosophy /> */}
    </>
  );
}

export default Home;
