import { GoldDivider } from "@/components/site/gold-divider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClients } from "@/lib/data/clients";
import { formatPrice, formatDateTimeShort } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients();

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query)
      )
    : clients;

  return (
    <div>
      <h1 className="font-display text-2xl text-[#F5F5F5] sm:text-3xl">Clients</h1>
      <p className="mt-1 text-sm text-[#888888]">{clients.length} total client{clients.length === 1 ? "" : "s"}</p>

      <GoldDivider className="my-6" />

      <form method="get" className="mb-4 max-w-sm">
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email, or phone..."
          className="border-white/10 bg-[#1A1A1A] text-[#F5F5F5]"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#1A1A1A]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-[#888888]">Name</TableHead>
              <TableHead className="text-[#888888]">Contact</TableHead>
              <TableHead className="text-[#888888]">Visits</TableHead>
              <TableHead className="text-[#888888]">Total Spent</TableHead>
              <TableHead className="text-[#888888]">Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="text-center text-sm text-[#888888]">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.email} className="border-white/5">
                  <TableCell className="font-medium text-[#F5F5F5]">{client.name}</TableCell>
                  <TableCell className="text-[#888888]">
                    <div>{client.email}</div>
                    <div>{client.phone}</div>
                  </TableCell>
                  <TableCell className="text-[#F5F5F5]">{client.totalVisits}</TableCell>
                  <TableCell className="text-[#F5F5F5]">{formatPrice(client.totalSpentCents)}</TableCell>
                  <TableCell className="text-[#888888]">
                    {client.lastVisit
                      ? formatDateTimeShort(new Date(client.lastVisit), SHOP_TIMEZONE)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
