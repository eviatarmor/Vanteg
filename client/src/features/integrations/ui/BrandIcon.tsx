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

export function BrandIconCard({
  slug,
  name,
  className,
}: {
  slug: string
  name: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white shadow-xs dark:border-white/20 dark:bg-neutral-100",
        className
      )}
    >
      <BrandIcon slug={slug} name={name} />
    </span>
  )
}
