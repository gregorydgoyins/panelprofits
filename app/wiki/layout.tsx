import Link from 'next/link';
export default function WikiLayout({children}:{children:React.ReactNode}) {
 return <><nav aria-label="Wiki navigation" className="mx-auto flex max-w-7xl flex-wrap gap-5 border-b border-slate-800 px-4 py-4 text-sm text-cyan-300 sm:px-6">
 <Link href="/wiki">Panel Profits Wiki</Link><Link href="/wiki/categories">Categories</Link><Link href="/comics">Issues and editions</Link><Link href="/lexicon">Financial glossary</Link><Link href="/wiki/help">Wiki help</Link><Link href="/sniper">Sniper</Link>
 </nav>{children}</>;
}
