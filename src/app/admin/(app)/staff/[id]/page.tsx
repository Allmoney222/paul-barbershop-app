import { notFound } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";
import { GoldDivider } from "@/components/site/gold-divider";
import { StaffForm } from "@/components/admin/staff-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { updateStaff, resendStaffInvite } from "@/lib/actions/staff";
import { createClient } from "@/lib/supabase/server";

export default async function EditStaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invited?: string }>;
}) {
  await requireAdmin();
  const [{ id }, { invited }] = await Promise.all([params, searchParams]);

  const supabase = await createClient();
  const { data: staff } = await supabase.from("staff").select("*").eq("id", id).maybeSingle();

  if (!staff) notFound();

  const hasAccount = Boolean(staff.auth_user_id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Edit {staff.name}</h1>

      <GoldDivider className="my-6" />

      <StaffForm staff={staff} action={updateStaff} />

      <GoldDivider className="my-6" />

      <section className="rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
        <h2 className="font-display text-lg text-[#F5F5F5]">Portal Access</h2>

        {invited === "1" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Invite sent to {staff.email}. They&apos;ll receive an email with a link to set their password.
          </div>
        )}

        <div className="mt-3 flex items-start gap-3">
          <div
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${hasAccount ? "bg-emerald-400" : "bg-[#888888]"}`}
          />
          <div>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {hasAccount ? "Invite sent — account linked" : "No invite sent yet"}
            </p>
            <p className="mt-0.5 text-xs text-[#888888]">
              {hasAccount
                ? `${staff.name} can log in at /barber/login once they set their password.`
                : `${staff.name} won't be able to access the barber portal until you send them an invite.`}
            </p>
          </div>
        </div>

        <form action={resendStaffInvite} className="mt-4">
          <input type="hidden" name="id" value={staff.id} />
          <Button
            type="submit"
            variant="outline"
            className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5]"
          >
            <Mail className="mr-2 h-4 w-4" />
            {hasAccount ? "Re-send Invite Email" : "Send Invite Email"}
          </Button>
        </form>
      </section>
    </div>
  );
}
