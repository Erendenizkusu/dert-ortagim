/**
 * Supabase şeması için elle yazılmış tipler.
 * Şema değişince `supabase gen types` ile yeniden üretilebilir.
 */

export type PostStatus = "open" | "solved";

export type UserRole = "user" | "moderator";

export type ReportReason =
  | "spam"
  | "taciz"
  | "siddet"
  | "cinsel"
  | "kendine_zarar"
  | "alakasiz"
  | "diger";

export type ReportTargetType = "post" | "advice";

/** mod_stats() RPC'sinin döndürdüğü topluluk sağlık metrikleri (ham sayılar). */
export type ModStats = {
  users_total: number;
  users_new_7d: number;
  posts_total: number;
  posts_today: number;
  advices_total: number;
  advices_today: number;
  open_posts: number;
  solved_posts: number;
  unanswered_total: number;
  unanswered_over_24h: number;
  avg_hours_to_first_advice: number | null;
  reports_open: number;
  reports_total: number;
  hidden_total: number;
};

/** mod_list_reports() RPC'sinin döndürdüğü zenginleştirilmiş rapor satırı. */
export type ModReport = {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  note: string | null;
  created_at: string;
  title: string;
  body: string;
  is_hidden: boolean;
  category: string | null;
  link_id: string;
  report_count: number;
};

/** posts_public / advices_public view'larının döndürdüğü maskeli satırlar.
 *  NOT: `type` (object literal) olmalı; `interface` `Record<string, unknown>`'a
 *  atanamadığı için Supabase `GenericSchema` kısıtını bozar. */
export type PostPublic = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  tags: string[];
  is_sensitive: boolean;
  status: PostStatus;
  solved_advice_id: string | null;
  me_too_count: number;
  advice_count: number;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  // Anonimse null döner:
  author_id: string | null;
  author_username: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  // Sadece giriş yapan kullanıcı için: bu benim gönderim mi?
  is_mine: boolean;
}

export type AdvicePublic = {
  id: string;
  post_id: string;
  body: string;
  is_helpful: boolean;
  created_at: string;
  is_anonymous: boolean;
  author_id: string | null;
  author_username: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  is_mine: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          role: UserRole;
          username_changed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          is_anonymous: boolean;
          title: string;
          body: string;
          category: string | null;
          tags: string[];
          is_sensitive: boolean;
          status: PostStatus;
          solved_advice_id: string | null;
          me_too_count: number;
          advice_count: number;
          is_hidden: boolean;
          hidden_at: string | null;
          hidden_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          is_anonymous?: boolean;
          title: string;
          body: string;
          category?: string | null;
          tags?: string[];
          is_sensitive?: boolean;
          status?: PostStatus;
          solved_advice_id?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          category?: string | null;
          tags?: string[];
          is_sensitive?: boolean;
          is_anonymous?: boolean;
          status?: PostStatus;
          solved_advice_id?: string | null;
        };
        Relationships: [];
      };
      advices: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          is_anonymous: boolean;
          body: string;
          is_helpful: boolean;
          is_hidden: boolean;
          hidden_at: string | null;
          hidden_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          is_anonymous?: boolean;
          body: string;
          is_helpful?: boolean;
        };
        Update: {
          body?: string;
          is_helpful?: boolean;
          is_anonymous?: boolean;
        };
        Relationships: [];
      };
      me_too: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: ReportReason;
          note: string | null;
          status: "open" | "reviewed" | "dismissed" | "actioned";
          created_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: ReportReason;
          note?: string | null;
        };
        Update: {
          status?: "open" | "reviewed" | "dismissed" | "actioned";
        };
        Relationships: [];
      };
    };
    Views: {
      posts_public: {
        Row: PostPublic;
        Relationships: [];
      };
      advices_public: {
        Row: AdvicePublic;
        Relationships: [];
      };
    };
    Functions: {
      cozum_toggle: {
        Args: { p_post_id: string; p_advice_id: string };
        Returns: undefined;
      };
      is_moderator: {
        Args: { uid: string };
        Returns: boolean;
      };
      submit_report: {
        Args: {
          p_target_type: ReportTargetType;
          p_target_id: string;
          p_reason: ReportReason;
          p_note?: string | null;
        };
        Returns: undefined;
      };
      mod_list_reports: {
        Args: Record<string, never>;
        Returns: ModReport[];
      };
      mod_action: {
        Args: { p_report_id: string; p_action: "hide" | "unhide" | "dismiss" };
        Returns: undefined;
      };
      mod_stats: {
        Args: Record<string, never>;
        Returns: ModStats;
      };
    };
    Enums: Record<string, never>;
  };
}
