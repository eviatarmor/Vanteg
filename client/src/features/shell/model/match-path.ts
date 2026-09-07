export function matchActivePath(pathname: string, itemPath: string): boolean {
  if (itemPath === "/") {
    return pathname === "/"
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}
