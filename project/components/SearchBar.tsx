import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <Input
        type="text"
        placeholder="Rechercher..."
        className="w-full bg-zinc-900/90 border-zinc-800 text-zinc-400 pl-10 h-9 text-sm rounded-lg focus:ring-violet-500/20 focus:border-violet-500/20"
      />
    </div>
  );
}