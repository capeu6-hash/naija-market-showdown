export function pageMeta(title: string, description: string) {
  return { meta: [{ title: `${title} — ShopArena NG` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — ShopArena NG` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}