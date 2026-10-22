import type { MenuNode } from '@/features/auth/api'

export function flattenMenuPaths(items: MenuNode[]): string[] {
  return items.flatMap((item) => [
    item.path,
    ...flattenMenuPaths(item.children ?? []),
  ])
}

export function activeMenuPath(
  pathname: string,
  paths: string[],
): string | null {
  let best: string | null = null

  for (const path of paths) {
    if (!path || path === '#') continue
    const to = `/app${path}`
    const matches = pathname === to || pathname.startsWith(`${to}/`)
    if (!matches) continue
    if (best === null || path.length > best.length) best = path
  }

  return best
}
