"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ModActionKind = "hide" | "unhide" | "dismiss";

/** Moderatör aksiyonu: gizle / göster / yoksay. Yetki RPC içinde kontrol edilir. */
export async function moderate(reportId: string, action: ModActionKind) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mod_action", {
    p_report_id: reportId,
    p_action: action,
  });
  if (!error) {
    revalidatePath("/moderasyon");
    revalidatePath("/");
  }
}
