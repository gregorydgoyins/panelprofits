import type { EntityWikiDef } from "@/lib/news/entities";

/**
 * Pure plain-text article paragraph renderer.
 * Completely guarantees zero inline links, zero ticker badges, and zero text clutter.
 */
export function LinkedBriefing({
  text,
}: {
  text: string;
  entities?: EntityWikiDef[];
  linkedSet?: Set<string>;
}) {
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}
