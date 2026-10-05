/**
 * Canonical URL builder for equity detail pages.
 *
 * Every client-side navigation to an equity detail view MUST use this helper
 * instead of hand-crafting `/asset/equity/...` or `/equity/...` template strings.
 *
 * The canonical route is `/equity/:id`.
 * `/asset/equity/:id` is kept as a compatibility route in App.tsx for old
 * bookmarks/deep-links but no production component should generate it.
 */
export function buildEquityUrl(id: string): string {
  return `/equity/${encodeURIComponent(id)}`;
}

export function buildIssueUrl(id: string): string {
  return `/issue/${encodeURIComponent(id)}`;
}

export function buildThematicUrl(surface: string, symbol: string): string {
  if (surface && surface.toLowerCase() !== 'thematic') {
    return `/asset/${encodeURIComponent(surface.toLowerCase())}/${encodeURIComponent(symbol)}`;
  }
  return `/thematic/${encodeURIComponent(symbol)}`;
}

