import { Search } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useStore();
  return (
    <div className="relative max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Buscar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-card border border-border rounded-full pl-5 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        maxLength={100}
      />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
    </div>
  );
};

export default SearchBar;
