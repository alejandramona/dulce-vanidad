import { useStore } from "@/context/StoreContext";

const CategoryFilter = () => {
  const { categories, selectedCategory, setSelectedCategory } = useStore();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`category-chip whitespace-nowrap ${
            selectedCategory === cat ? "category-chip-active" : "category-chip-inactive"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
