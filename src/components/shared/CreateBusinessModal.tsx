"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { useAddBusiness } from "@/features/app-shell/api/use-businesses";
import { BUSINESS_CATEGORIES, type BusinessCategory } from "@/lib/firebase/types";

export function CreateBusinessModal({
  open,
  onOpenChange,
  ownerId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string | undefined;
  onCreated: (businessId: string) => void;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const addBusiness = useAddBusiness(ownerId);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("Fashion & Retail");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addBusiness.mutate(
      { name: name.trim(), category },
      {
        onSuccess: (businessId) => {
          showToast("Bisnis berhasil dibuat", "success");
          setName("");
          setCategory("Fashion & Retail");
          onOpenChange(false);
          onCreated(businessId);
        },
        onError: () => showToast("Gagal membuat bisnis, coba lagi", "error"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Bisnis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-left text-[12.5px] font-semibold text-ink-2">
            Nama Bisnis
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Toko Baju Sinta"
              className="rounded-lg border border-line bg-gray-bg px-3 py-2.5 text-[13px] placeholder:text-ink-3"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5 text-left text-[12.5px] font-semibold text-ink-2">
            Kategori
            <Select value={category} onValueChange={(v) => setCategory(v as BusinessCategory)}>
              <SelectTrigger className="border-line bg-gray-bg text-[13px] text-ink">
                <SelectValue>{category}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button type="submit" disabled={!name.trim() || addBusiness.isPending} className="mt-1.5 w-full justify-center">
            {addBusiness.isPending ? "Membuat…" : "Buat Bisnis"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
