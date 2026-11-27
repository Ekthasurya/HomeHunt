
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PropertyGallery({ images = [], title = "Property" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const validImages = images
    .map((image) =>
      typeof image === "string" ? image : image?.url
    )
    .filter(Boolean);

  if (!validImages.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        No property images available
      </div>
    );
  }

  const previousImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">

      {/* Main Image */}
      <div className="group relative h-80 overflow-hidden rounded-2xl bg-gray-100 sm:h-[450px]">

        <img
          src={validImages[activeIndex]}
          alt={`${title} - Image ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />

        {/* Previous Button */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Image Counter */}
        <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {activeIndex + 1} / {validImages.length}
        </span>
      </div>

      {/* Thumbnail Images */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                activeIndex === index
                  ? "border-blue-600"
                  : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default PropertyGallery;
