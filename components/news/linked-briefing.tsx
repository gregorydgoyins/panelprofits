import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function LinkedBriefing({
  text,
}: {
  text: string;
  entities?: EntityWikiDef[];
  linkedSet?: Set<string>;
}) {
  return <>{text}</>;
}
