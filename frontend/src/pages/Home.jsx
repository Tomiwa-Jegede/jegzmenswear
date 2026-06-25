import { useEffect, useState } from "react";
import api from "../lib/axios";
import Hero from "../components/Hero";
import FeaturedCollections from "../components/FeaturedCollections";
import RugbyPoloSpotlight from "../components/RugbyPoloSpotlight";
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
      <Hero />
      <FeaturedCollections collections={collections} />
      <RugbyPoloSpotlight />
      <CampaignEditorial />
      <BrandPhilosophy />
    </>
  );
}

export default Home;
