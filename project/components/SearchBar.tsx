import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Rechercher une playlist..."
        className="w-full bg-zinc-900/90 border-zinc-800 text-zinc-400 pl-10 h-9 text-sm rounded-lg focus:ring-violet-500/20 focus:border-violet-500/20"
      />
    </div>
  );
}