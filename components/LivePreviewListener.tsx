"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

// Refreshes the route when Payload autosaves a draft, so the admin Live Preview
// iframe updates in near-real-time as Sabine edits.
export default function LivePreviewListener({ serverURL }: { serverURL: string }) {
  const router = useRouter();
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />;
}
