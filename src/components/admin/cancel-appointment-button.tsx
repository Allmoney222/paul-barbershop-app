"use client";

import { useRef } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelAppointment } from "@/lib/actions/appointments";

export function CancelAppointmentButton({ id, clientName }: { id: string; clientName: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (confirm(`Cancel ${clientName}'s appointment? This cannot be undone.`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={cancelAppointment}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel Appointment
      </Button>
    </form>
  );
}
