import { signInAsBarber } from "@/lib/actions/barber-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoldDivider } from "@/components/site/gold-divider";

export default async function BarberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#F5F5F5]">
            <span className="italic text-[#C9A96E]">2Gether</span> Hair Studio
          </h1>
          <p className="mt-1 text-sm text-[#888888]">Barber portal sign in</p>
        </div>

        <GoldDivider className="my-6" />

        <form action={signInAsBarber} className="space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[#F5F5F5]">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border-white/10 bg-[#0D0D0D] text-[#F5F5F5]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#F5F5F5]">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-white/10 bg-[#0D0D0D] text-[#F5F5F5]"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
