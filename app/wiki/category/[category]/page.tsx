import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createPublicServerClient} from '@/lib/supabase/server';
import {wikiCategories} from '@/lib/wiki/structure';
export const dynamic='force-dynamic';
export default async function CategoryPage({params,searchParams}:{params:Promise<{category:string}>;searchParams:Promise<{page?:string}>}) {
 const {category}=await params;const match=wikiCategories[category as keyof typeof wikiCategories];if(!match)notFound();
 const page=Math.min(10000,Math.max(1,Number.parseInt((await searchParams).page || '1',10)||1));
 const {data,error}=await createPublicServerClient().from('ppcf_wiki_pages').select('slug,display_title,universe,page_type').in(match.column,[...match.values]).order('display_title').order('slug').range((page-1)*48,page*48);
 if(error)throw new Error('Wiki category could not be read');
 const rows=data || [];const hasMore=rows.length>48;
 return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8"><Link href="/wiki/categories" className="text-cyan-300">All categories</Link><h1 className="text-3xl text-white">Category: {match.title}</h1><ul className="grid gap-3 sm:grid-cols-2">{rows.slice(0,48).map(row=><li key={row.slug} className="border border-slate-800 p-3"><Link href={`/wiki/entry/${encodeURIComponent(row.slug)}?universe=${encodeURIComponent(row.universe)}`} className="text-cyan-300">{row.display_title}</Link><p className="text-xs text-slate-500">{row.universe} · {row.page_type}</p></li>)}</ul>{!rows.length && <p className="text-slate-400">No stored articles in this category on this page.</p>}<nav aria-label="Category pages" className="flex gap-6 text-cyan-300">{page>1 && <Link href={`?page=${page-1}`}>Previous</Link>}<span className="text-slate-400">Page {page}</span>{hasMore && <Link href={`?page=${page+1}`}>Next</Link>}</nav></main>;
}
