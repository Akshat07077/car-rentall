"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, Car as CarIcon } from "lucide-react";
import { formatINR, type CarData } from "@/components/car-card";

export default function AdminCarsPage() {
  const queryClient = useQueryClient();
  const { data: cars, isLoading } = useQuery<CarData[]>({
    queryKey: ["cars"],
    queryFn: () => apiFetch<CarData[]>("/api/cars"),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarData | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await apiFetch(`/api/cars/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({ title: "Deleted", description: "Vehicle removed." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const openEdit = (car: CarData) => { setEditingCar(car); setFormOpen(true); };
  const openCreate = () => { setEditingCar(null); setFormOpen(true); };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Manage Fleet</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove vehicles.</p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="rounded-xl shadow-md shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            </DialogHeader>
            <CarForm
              car={editingCar}
              onSuccess={() => {
                setFormOpen(false);
                queryClient.invalidateQueries({ queryKey: ["cars"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Price/Day</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Skeleton className="h-8 w-full" /></td></tr>
              ) : cars?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No vehicles found. Add one above.</td></tr>
              ) : cars?.map((car) => (
                <tr key={car.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-muted rounded-lg overflow-hidden shrink-0 relative">
                        {car.imageUrl
                          ? <Image src={car.imageUrl} fill className="object-cover" alt="" />
                          : <CarIcon className="w-full h-full p-2 text-muted-foreground/50" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{car.brand} {car.model}</div>
                        <div className="text-xs text-muted-foreground">{car.year} • {car.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="capitalize">{car.transmission}</div>
                    <div className="capitalize">{car.fuelType} • {car.seats} seats</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{formatINR(car.pricePerDay)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={car.available ? "default" : "secondary"} className={car.available ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none" : ""}>
                      {car.available ? "Available" : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(car)} className="hover:bg-primary/10 hover:text-primary rounded-lg">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(car.id)} className="hover:bg-destructive/10 hover:text-destructive rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CarForm({ car, onSuccess }: { car: CarData | null; onSuccess: () => void }) {
  const [imageUrl, setImageUrl] = useState(car?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
      toast({ title: "Image Uploaded" });
    } catch (e: any) {
      toast({ title: "Upload Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      brand: fd.get("brand"),
      model: fd.get("model"),
      year: parseInt(fd.get("year") as string),
      pricePerDay: parseFloat(fd.get("pricePerDay") as string),
      transmission: fd.get("transmission"),
      fuelType: fd.get("fuelType"),
      seats: parseInt(fd.get("seats") as string),
      location: fd.get("location"),
      description: fd.get("description"),
      available: fd.get("available") === "true",
      imageUrl,
    };
    try {
      if (car) {
        await apiFetch(`/api/cars/${car.id}`, { method: "PUT", body: JSON.stringify(data) });
        toast({ title: "Vehicle Updated" });
      } else {
        await apiFetch("/api/cars", { method: "POST", body: JSON.stringify(data) });
        toast({ title: "Vehicle Created" });
      }
      onSuccess();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      <div className="flex gap-6 items-start p-4 bg-muted/30 rounded-2xl border border-border/50">
        <div className="w-32 h-24 bg-muted rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0 relative group">
          {imageUrl
            ? <Image src={imageUrl} fill className="object-cover" alt="Preview" />
            : <CarIcon className="w-8 h-8 text-muted-foreground/30" />}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">Vehicle Image</Label>
          <p className="text-sm text-muted-foreground mb-2">Click the image to upload via Cloudinary.</p>
          {isUploading && <span className="text-sm text-primary">Uploading...</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Brand</Label><Input name="brand" defaultValue={car?.brand} required className="rounded-lg" /></div>
        <div className="space-y-2"><Label>Model</Label><Input name="model" defaultValue={car?.model} required className="rounded-lg" /></div>
        <div className="space-y-2"><Label>Year</Label><Input name="year" type="number" defaultValue={car?.year} required className="rounded-lg" /></div>
        <div className="space-y-2"><Label>Price Per Day ($)</Label><Input name="pricePerDay" type="number" step="0.01" defaultValue={car?.pricePerDay} required className="rounded-lg" /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Transmission</Label>
          <select name="transmission" defaultValue={car?.transmission || "automatic"} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Fuel Type</Label>
          <select name="fuelType" defaultValue={car?.fuelType || "petrol"} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="space-y-2"><Label>Seats</Label><Input name="seats" type="number" defaultValue={car?.seats || 5} required className="rounded-lg" /></div>
        <div className="space-y-2">
          <Label>Location (City)</Label>
          <select name="location" defaultValue={car?.location || ""} required className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="" disabled>Select city</option>
            {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Surat", "Goa"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <select name="available" defaultValue={car?.available === false ? "false" : "true"} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="true">Available for Rent</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={car?.description ?? ""} rows={4} className="rounded-lg resize-none" />
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button type="submit" disabled={isSubmitting || isUploading} className="rounded-xl px-8 shadow-lg shadow-primary/20">
          {isSubmitting ? "Saving..." : car ? "Save Changes" : "Create Vehicle"}
        </Button>
      </div>
    </form>
  );
}
