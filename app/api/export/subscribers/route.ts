import { getAuthUser, getPayloadClient } from "@/lib/payload";

// The newsletter list as a spreadsheet, for moving it into an email platform.
// Panel users only: it is a list of personal addresses.
const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // A leading = + - @ makes a spreadsheet run the cell as a formula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  const user = await getAuthUser();
  if (!user) return new Response("Not signed in.", { status: 401 });

  const payload = await getPayloadClient();
  const rows: string[] = [
    ["Email", "First name", "Signed up", "Signed up from", "Agreed to", "Agreed on"].map(cell).join(","),
  ];
  let page = 1;
  for (;;) {
    const res = await payload.find({
      collection: "subscribers",
      sort: "-createdAt",
      limit: 500,
      page,
      depth: 0,
      overrideAccess: true,
    });
    for (const d of res.docs as unknown as Record<string, unknown>[]) {
      rows.push(
        [d.email, d.firstName, d.createdAt, d.source, d.consentText, d.consentAt].map(cell).join(",")
      );
    }
    if (!res.hasNextPage) break;
    page += 1;
  }

  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel reads accented names as UTF-8.
  return new Response(`﻿${rows.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="breathwork-tulum-newsletter-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
