"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const clientDetailsSchema = z.object({
  clientName: z.string().min(2, "Please enter your full name"),
  clientEmail: z.string().email("Please enter a valid email"),
  clientPhone: z.string().min(7, "Please enter a valid phone number"),
  clientNotes: z.string().max(1000).optional(),
});

export type ClientDetails = z.infer<typeof clientDetailsSchema>;

export function DetailsStep({
  defaultValues,
  onSubmit,
  formId,
}: {
  defaultValues: ClientDetails;
  onSubmit: (values: ClientDetails) => void;
  formId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientDetails>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues,
  });

  return (
    <div>
      <h2 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Your Details</h2>
      <p className="mt-1 text-sm text-[#888888]">We&apos;ll send your confirmation here.</p>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-[#F5F5F5]">
            Full Name
          </Label>
          <Input
            id="clientName"
            placeholder="Jane Doe"
            className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5] placeholder:text-[#666]"
            {...register("clientName")}
          />
          {errors.clientName && <p className="text-xs text-red-400">{errors.clientName.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientPhone" className="text-[#F5F5F5]">
              Phone Number
            </Label>
            <Input
              id="clientPhone"
              type="tel"
              placeholder="(716) 555-0100"
              className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5] placeholder:text-[#666]"
              {...register("clientPhone")}
            />
            {errors.clientPhone && <p className="text-xs text-red-400">{errors.clientPhone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="text-[#F5F5F5]">
              Email
            </Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="jane@email.com"
              className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5] placeholder:text-[#666]"
              {...register("clientEmail")}
            />
            {errors.clientEmail && <p className="text-xs text-red-400">{errors.clientEmail.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientNotes" className="text-[#F5F5F5]">
            Note for your stylist <span className="text-[#888888]">(optional)</span>
          </Label>
          <Textarea
            id="clientNotes"
            placeholder="Anything we should know before your visit?"
            className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5] placeholder:text-[#666]"
            {...register("clientNotes")}
          />
        </div>
      </form>
    </div>
  );
}
