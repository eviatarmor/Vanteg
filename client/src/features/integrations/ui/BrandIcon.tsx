import { cn } from "@workspace/ui/lib/utils"

export function brandIconUrl(slug: string): string {
  return `https://thesvg.org/icons/${slug}/default.svg`
}

export function BrandIcon({
  slug,
  name,
  className,
}: {
  slug: string
  name: string
  className?: string
}) {
  return (
    <img
      src={brandIconUrl(slug)}
      alt=""
      title={name}
      loading="lazy"
      decoding="async"
      className={cn("size-5 shrink-0 object-contain", className)}
    />
  )
}
