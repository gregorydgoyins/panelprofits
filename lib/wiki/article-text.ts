/** Display imported text without exposing template parameters as prose. Raw source records stay unchanged. */
export function wikiPlainText(value:string|null|undefined):string {
 return (value || '').replace(/<!--[^]*?-->/g,'').replace(/<ref\b[^>]*>[^]*?<\/ref>/gi,'').replace(/<[^>]+>/g,'').replace(/\{\{[^{}]*\}\}/g,'').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'$2').replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/'{2,5}/g,'').replace(/\b[A-Z][a-z ]*:\s*\|[a-z_]+\s*=\s*\./g,'').replace(/\|[a-z_]+\s*=/gi,'').replace(/\\n/g,'\n').trim();
}
