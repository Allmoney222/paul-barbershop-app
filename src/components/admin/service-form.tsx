"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "@/components/admin/photo-upload";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service, Staff } from "@/types/database";

const inputClass = "border-white/10 bg-[#0D0D0D] text-[#F5F5F5]";

export function ServiceForm({
  service,
  allStaff,
  assignedStaffIds,
  action,
}: {
  service?: Service;
  allStaff: Staff[];
  assignedStaffIds: string[];
  action: (formData: FormData) => void;
}) {
  const isEdit = Boolean(service);

  return (
    <form action={action} className="space-y-5 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
      {isEdit && <input type="hidden" name="id" value={service!.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[#F5F5F5]">
            Service Name
          </Label>
          <Input id="name" name="name" required defaultValue={service?.name} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-[#F5F5F5]">
            Category
          </Label>
          <select
            id="category"
            name="category"
            defaultValue={service?.category ?? SERVICE_CATEGORIES[0]}
            className="flex h-9 w-full rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-1 text-sm text-[#F5F5F5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price" className="text-[#F5F5F5]">
            Price (USD)
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={service ? (service.price_cents / 100).toFixed(2) : ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration_minutes" className="text-[#F5F5F5]">
            Duration (minutes)
          </Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="5"
            step="5"
            required
            defaultValue={service?.duration_minutes ?? 30}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#F5F5F5]">Service Photo</Label>
        <PhotoUpload defaultUrl={service?.photo_url} inputClass={inputClass} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-[#F5F5F5]">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5 sm:w-32">
        <Label htmlFor="sort_order" className="text-[#F5F5F5]">
          Sort Order
        </Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={service?.sort_order ?? 0}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[#F5F5F5]">Available Staff</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {allStaff.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm text-[#F5F5F5]">
              <input
                type="checkbox"
                name="staff_ids"
                value={member.id}
                defaultChecked={assignedStaffIds.includes(member.id)}
                className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
              />
              {member.name}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
        <input
          type="checkbox"
          name="requires_deposit"
          defaultChecked={service?.requires_deposit ?? false}
          className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
        />
        Requires deposit at booking
      </label>

      <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
        <input
          type="checkbox"
          name="active"
          defaultChecked={service?.active ?? true}
          className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
        />
        Active (visible &amp; bookable on public site)
      </label>

      <div className="flex gap-3">
        <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
          {isEdit ? "Save Changes" : "Create Service"}
        </Button>
        <Button asChild variant="outline" className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]">
          <Link href="/admin/services">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
