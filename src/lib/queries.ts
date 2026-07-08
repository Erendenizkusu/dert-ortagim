import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PostPublic, AdvicePublic, ModReport } from "@/lib/database.types";

const POST_COLS =
  "id,title,body,category,tags,is_sensitive,status,solved_advice_id,me_too_count,advice_count,created_at,updated_at,is_anonymous,author_id,author_username,author_display_name,author_avatar_url,is_mine" as const;

const ADVICE_COLS =
  "id,post_id,body,is_helpful,created_at,is_anonymous,author_id,author_username,author_display_name,author_avatar_url,is_mine" as const;

export type FeedTab = "yeni" | "populer";

export interface FeedOpts {
  tab?: FeedTab;
  category?: string;
  limit?: number;
}

export async function getFeed({
  tab = "yeni",
  category,
  limit = 50,
}: FeedOpts = {}): Promise<PostPublic[]> {
  const supabase = await createClient();
  let q = supabase.from("posts_public").select(POST_COLS);
  if (category) q = q.eq("category", category);
  if (tab === "populer") {
    q = q
      .order("me_too_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }
  const { data, error } = await q.limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Verilen post id'lerinden giriş yapan kullanıcının "ben de" dediklerini döndürür. */
export async function getMyMeTooSet(postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("me_too")
    .select("post_id")
    .in("post_id", postIds);
  return new Set((data ?? []).map((r) => r.post_id));
}

export async function getPost(id: string): Promise<PostPublic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts_public")
    .select(POST_COLS)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdvices(postId: string): Promise<AdvicePublic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("advices_public")
    .select(ADVICE_COLS)
    .eq("post_id", postId)
    .order("is_helpful", { ascending: false })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export interface SearchOpts {
  q?: string;
  category?: string;
  tag?: string;
  durum?: "solved" | "bekleyen";
}

export async function searchPosts({
  q,
  category,
  tag,
  durum,
}: SearchOpts): Promise<PostPublic[]> {
  const supabase = await createClient();
  let query = supabase.from("posts_public").select(POST_COLS);

  if (q && q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "turkish",
    });
  }
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);
  if (durum === "solved") query = query.eq("status", "solved");
  if (durum === "bekleyen") query = query.eq("advice_count", 0);

  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

/** Moderasyon paneli: açık raporlar (yalnız moderatör; RPC içinde yetki kontrolü var). */
export async function getOpenReports(): Promise<ModReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mod_list_reports");
  if (error) throw error;
  return (data as ModReport[] | null) ?? [];
}

/** Profil paneli: kullanıcının kendi dertleri ve tavsiyeleri + istatistik. */
export async function getProfileData(userId: string) {
  const supabase = await createClient();
  const [posts, advices] = await Promise.all([
    // is_mine filtresi anonim gönderileri de kapsar (author_id anonimde null'dur)
    supabase
      .from("posts_public")
      .select(POST_COLS)
      .eq("is_mine", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("advices")
      .select("id,post_id,body,is_helpful,is_anonymous,created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  return { posts: posts.data ?? [], advices: advices.data ?? [] };
}
