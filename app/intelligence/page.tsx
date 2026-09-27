import { redirect } from "next/navigation";

export default async function IntelligencePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  redirect(`/wiki${query}`);
}
