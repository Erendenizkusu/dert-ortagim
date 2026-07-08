/**
 * Supabase şeması için elle yazılmış tipler.
 * Şema değişince `supabase gen types` ile yeniden üretilebilir.
 */

export type PostStatus = "open" | "solved";

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
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
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
    };
    Enums: Record<string, never>;
  };
}
