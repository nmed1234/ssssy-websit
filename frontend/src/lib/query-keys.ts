/**
 * Centralised React Query key factory.
 *
 * Usage:
 *   queryKey: queryKeys.news.list()
 *   queryKey: queryKeys.events.detail("my-slug")
 *
 * Keys follow [domain, operation, ...params] convention so React Query
 * can invalidate at any granularity: e.g.
 *   queryClient.invalidateQueries({ queryKey: queryKeys.news.all() })
 *   invalidates every news query.
 */

export const queryKeys = {
  news: {
    all: ()         => ["news"] as const,
    list: (page = 0) => ["news", "list", page] as const,
    detail: (slug: string) => ["news", "detail", slug] as const,
  },

  events: {
    all: ()          => ["events"] as const,
    list: (page = 0) => ["events", "list", page] as const,
    upcoming: ()     => ["events", "upcoming"] as const,
    detail: (slug: string) => ["events", "detail", slug] as const,
  },

  jobs: {
    all: ()          => ["jobs"] as const,
    list: (page = 0) => ["jobs", "list", page] as const,
    detail: (slug: string) => ["jobs", "detail", slug] as const,
  },

  members: {
    all: ()          => ["members"] as const,
    list: (page = 0) => ["members", "list", page] as const,
    detail: (slug: string) => ["members", "detail", slug] as const,
  },

  publications: {
    all: ()              => ["publications"] as const,
    list: (page = 0)     => ["publications", "list", page] as const,
  },

  content: {
    all: ()              => ["content"] as const,
    byType: (type: string, page = 0) => ["content", "type", type, page] as const,
    detail: (slug: string) => ["content", "detail", slug] as const,
  },

  systemConfig: {
    all: () => ["systemConfig"] as const,
  },

  themeSettings: {
    all: () => ["themeSettings"] as const,
  },

  siteSections: {
    all: ()                    => ["siteSections"] as const,
    byContext: (ctx: string)   => ["siteSections", ctx] as const,
  },

  boardMembers: {
    all: () => ["boardMembers"] as const,
  },
} as const;
