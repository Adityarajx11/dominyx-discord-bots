import { createRoot } from "react-dom/client";
import ReviewsGallery from "./components/ReviewsGallery";

const mount = document.getElementById("reviews-gallery-root");

if (mount) {
  createRoot(mount).render(
    <ReviewsGallery headingClassName="hero-title" background="transparent" />,
  );
}
