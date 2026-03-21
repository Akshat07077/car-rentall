"use client";
import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CarCard, type CarData } from "@/components/car-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { Search, FilterX, Car as CarIcon, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

interface Filters {
  location?: string;
  transmission?: string;
  fuel_type?: string;
  max_price?: number;
}

const CITIES = [
  { name: "Mumbai", emoji: "🏙️" },
  { name: "Delhi", emoji: "🕌" },
  { name: "Bengaluru", emoji: "🌿" },
  { name: "Hyderabad", emoji: "💎" },
  { name: "Chennai", emoji: "🌊" },
  { name: "Pune", emoji: "🏔️" },
  { name: "Kolkata", emoji: "🎨" },
  { name: "Jaipur", emoji: "🏯" },
];

function FilterPanel({ filters, onChange, onClear }: {
  filters: Filters;
  onChange: (key: keyof Filters, value: string | number | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transmission</Label>
          <select
            className="flex h-11 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filters.transmission || "all"}
            onChange={(e) => onChange("transmission", e.target.value === "all" ? undefined : e.target.value)}
          >
            <option value="all">Any Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fuel Type</Label>
          <select
            className="flex h-11 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filters.fuel_type || "all"}
            onChange={(e) => onChange("fuel_type", e.target.value === "all" ? undefined : e.target.value)}
          >
            <option value="all">Any Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

        <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Price / Day</Label>
          <span className="text-sm font-bold text-primary">
            {filters.max_price && filters.max_price < 15000
              ? `₹${filters.max_price.toLocaleString("en-IN")}`
              : "₹15,000+"}
          </span>
        </div>
        <input
          type="range" min="500" max="15000" step="250"
          value={filters.max_price || 15000}
          onChange={(e) => onChange("max_price", parseInt(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹500</span><span>₹15,000+</span>
        </div>
      </div>

      <Button variant="outline" className="w-full rounded-xl border-dashed" onClick={onClear}>
        <FilterX className="w-4 h-4 mr-2" /> Clear Filters
      </Button>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense>
      <CarsContent />
    </Suspense>
  );
}

function CarsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    location: searchParams.get("location") || undefined,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryString = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString();

  // Fetch all cars (no filters) to get per-city counts
  const { data: allCars } = useQuery<CarData[]>({
    queryKey: ["cars-all"],
    queryFn: () => apiFetch<CarData[]>("/api/cars"),
  });

  const { data: cars, isLoading } = useQuery<CarData[]>({
    queryKey: ["cars", filters],
    queryFn: () => apiFetch<CarData[]>(`/api/cars${queryString ? `?${queryString}` : ""}`),
  });

  const cityCount = (city: string) =>
    allCars?.filter((c) => c.location?.toLowerCase() === city.toLowerCase()).length ?? 0;

  const handleChange = (key: keyof Filters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const selectCity = (city: string) => {
    setFilters((prev) => ({ ...prev, location: prev.location === city ? undefined : city }));
  };

  const clearFilters = () => setFilters({});
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

      {/* City tabs */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-1">Browse Fleet</h1>
        <p className="text-muted-foreground text-sm mb-5">
          {filters.location
            ? `Showing cars in ${filters.location}`
            : "All cities · Select a city to filter"}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleChange("location", undefined)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              !filters.location
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "border-border bg-card hover:border-primary/40 hover:text-primary"
            }`}
          >
            🇮🇳 All Cities
            {allCars && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${!filters.location ? "bg-white/20" : "bg-muted"}`}>
                {allCars.length}
              </span>
            )}
          </button>
          {CITIES.map((city) => {
            const count = cityCount(city.name);
            const active = filters.location === city.name;
            return (
              <button
                key={city.name}
                onClick={() => selectCity(city.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40 hover:text-primary"
                }`}
              >
                <span>{city.emoji}</span>
                {city.name}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${active ? "bg-white/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile filter toggle */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            More Filters
            {activeCount > 1 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeCount - (filters.location ? 1 : 0)}
              </span>
            )}
          </span>
          {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {filtersOpen && (
          <div className="mt-3 p-4 bg-card border border-border rounded-2xl">
            <FilterPanel filters={filters} onChange={handleChange} onClear={clearFilters} />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-lg font-display font-bold tracking-tight mb-5">More Filters</h2>
            <FilterPanel filters={filters} onChange={handleChange} onClear={clearFilters} />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              <span className="font-bold text-foreground">{cars?.length ?? 0}</span> vehicles found
              {filters.location && (
                <span> in <span className="font-bold text-foreground">{filters.location}</span></span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <CarIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Try adjusting your filters or selecting a different city.</p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={clearFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
