
import PropertyCard from "./PropertyCard";

function PropertyGrid({ properties = [] }) {
  if (!properties.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
        <h3 className="text-xl font-semibold text-gray-800">
          No Properties Found
        </h3>

        <p className="mt-2 text-gray-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
        />
      ))}
    </div>
  );
}

export default PropertyGrid;
