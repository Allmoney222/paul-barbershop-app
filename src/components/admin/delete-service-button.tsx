"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteService } from "@/lib/actions/services";

export function DeleteServiceButton({ id, name }: { id: string; name: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (confirm(`Delete "${name}"? Any linked appointments will also be removed. This cannot be undone.`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={deleteService}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Service
      </Button>
    </form>
  );
}
