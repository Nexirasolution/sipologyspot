"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-md"
    >
      <Search className="h-5 w-5 shrink-0 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for oils, spice powders & more..."
        className="w-full flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-forest/90"
      >
        Search
      </button>
    </form>
  );
}