"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "@/components/admin/photo-upload";
import type { Staff } from "@/types/database";

const inputClass = "border-white/10 bg-[#0D0D0D] text-[#F5F5F5]";

export function StaffForm({
  staff,
  action,
}: {
  staff?: Staff;
  action: (formData: FormData) => void;
}) {
  const isEdit = Boolean(staff);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="space-y-5 rounded-xl border border-white/5 bg-[#1A1A1A] p-6"
    >
      {isEdit && <input type="hidden" name="id" value={staff!.id} />}

      <div className="rounded-2xl border border-[#C9A96E]/30 bg-[#111111] p-4 text-sm text-[#E5DAB3] shadow-[0_0_0_1px_rgba(201,169,110,0.2)]">
        <p className="font-medium text-[#F5F5F5]">Staff Photo Upload</p>
        <p className="mt-1 text-sm text-[#BDB5A2]">
          Use the photo upload field below to attach a staff image. You can also paste an external photo URL if needed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[#F5F5F5]">
            Name
          </Label>
          <Input id="name" name="name" required defaultValue={staff?.name} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#F5F5F5]">
            Email
          </Label>
          <Input id="email" name="email" type="email" required defaultValue={staff?.email} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-[#F5F5F5]">
            Phone
          </Label>
          <Input id="phone" name="phone" defaultValue={staff?.phone ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-[#F5F5F5]">
            Role
          </Label>
          <select
            id="role"
            name="role"
            defaultValue={staff?.role ?? "stylist"}
            className="flex h-9 w-full rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-1 text-sm text-[#F5F5F5] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="admin">Admin (Owner)</option>
            <option value="stylist">Stylist</option>
            <option value="barber">Barber</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-[#C9A96E]/30 bg-[#151515] p-4 shadow-[0_0_0_1px_rgba(201,169,110,0.2)]">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="photo" className="text-[#F5F5F5]">
            Photo Upload
          </Label>
          <span className="rounded-full bg-[#C9A96E]/10 px-3 py-1 text-xs font-medium text-[#C9A96E]">
            New feature
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="block w-full rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm text-[#F5F5F5] shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#C9A96E] file:px-4 file:py-2 file:text-[#0D0D0D]"
          />
          <span className="text-xs text-[#888888]">
            Optional. Upload an image from your computer, or provide a Photo URL below.
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#F5F5F5]">Photo</Label>
        <PhotoUpload defaultUrl={staff?.photo_url} inputClass={inputClass} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialties" className="text-[#F5F5F5]">
          Specialties (comma-separated)
        </Label>
        <Input
          id="specialties"
          name="specialties"
          defaultValue={(staff?.specialties ?? []).join(", ")}
          placeholder="Fades, Beard Trims, Color"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-[#F5F5F5]">
          Bio
        </Label>
        <Textarea id="bio" name="bio" rows={3} defaultValue={staff?.bio ?? ""} className={inputClass} />
      </div>

      <div className="space-y-1.5 sm:w-32">
        <Label htmlFor="sort_order" className="text-[#F5F5F5]">
          Sort Order
        </Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={staff?.sort_order ?? 0}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
        <input
          type="checkbox"
          name="active"
          defaultChecked={staff?.active ?? true}
          className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
        />
        Active (visible on public site &amp; bookable)
      </label>

      {!isEdit && (
        <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
          <input
            type="checkbox"
            name="send_invite"
            defaultChecked
            className="h-4 w-4 rounded border-white/10 bg-[#0D0D0D] accent-[#C9A96E]"
          />
          Send login invite email to this staff member
        </label>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
          {isEdit ? "Save Changes" : "Create Staff Member"}
        </Button>
        <Button asChild variant="outline" className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]">
          <Link href="/admin/staff">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
