import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    user_id: string;
    type: string;
    body?: string;
    title?: string;
    is_read: boolean;
    asset_id?: string | null;
    repair_id?: string | null;
    request_id?: string | null;
    assignment_id?: string | null;
  };
  schema: "public";
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  if (payload.record.type === "device_token") {
    return new Response("Skipped", { status: 200 });
  }

  const { data: tokenRow, error } = await supabase
    .from("notification_table")
    .select("token")
    .eq("user_id", payload.record.user_id)
    .eq("type", "device_token")
    .single();

  if (error || !tokenRow?.token) {
    return new Response("No token found for user", { status: 404 });
  }

  const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
    },
    body: JSON.stringify({
      to: tokenRow.token,
      sound: "default",
      title: payload.record.title ?? "New Notification",
      body: payload.record.body ?? "",
      data: {
        type: payload.record.type,
        assetId: payload.record.asset_id ?? null,
        repairId: payload.record.repair_id ?? null,
        requestId: payload.record.request_id ?? null,
        assignmentId: payload.record.assignment_id ?? null,
      },
    }),
  });

  const result = await expoRes.json();
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});