"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStaff } from "@/lib/actions/staff";

export function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (confirm(`Delete ${name}? This cannot be undone and will revoke their portal access.`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={deleteStaff}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Staff Member
      </Button>
    </form>
  );
}
