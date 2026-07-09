import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getAuthUser } from "@/lib/payload";

export type ChatModel = {
  value: string;
  label: string;
  free: boolean;
  context: number;
};

// OpenRouter's public model catalog, refreshed daily. Free models (":free"
// suffix) sort first so the admin panel can surface them as GRATIS.
const getModels = unstable_cache(
  async (): Promise<ChatModel[]> => {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) {
      console.error("[chat/models] OpenRouter catalog error", res.status);
      return [];
    }
    const { data } = (await res.json()) as {
      data: { id: string; name: string; context_length?: number }[];
    };
    return data
      .map((m) => ({
        value: m.id,
        label: m.name,
        free: m.id.endsWith(":free"),
        context: m.context_length ?? 0,
      }))
      .sort((a, b) => Number(b.free) - Number(a.free) || a.label.localeCompare(b.label));
  },
  ["openrouter-models"],
  { revalidate: 86400 }
);

/** Model list for the admin panel's model selector. Panel users only. */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ models: [] }, { status: 401 });
  return NextResponse.json({ models: await getModels() });
}
