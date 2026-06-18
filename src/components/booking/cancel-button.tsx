"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelButton({ token, canCancel }: { token: string; canCancel: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/appointments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to cancel appointment.");
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!canCancel) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          Cancel Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5]">
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription className="text-[#888888]">
            This can&apos;t be undone. If you need to reschedule instead, please book a new
            appointment after cancelling.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-[#888888] hover:bg-white/5 hover:text-[#F5F5F5]"
          >
            Keep Appointment
          </Button>
          <Button
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-500/90 text-white hover:bg-red-500"
          >
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
