import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[3px] border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap tracking-wide transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-zinc-300 bg-zinc-100 text-zinc-800 font-semibold",
        secondary:
          "border-zinc-200 bg-zinc-50 text-zinc-700 font-normal",
        destructive:
          "border-red-300 bg-red-50/80 text-[#991b1b] font-medium",
        outline:
          "border-zinc-300 bg-transparent text-zinc-800 font-normal",
        ghost:
          "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100",
        link: "border-transparent text-[#991b1b] underline-offset-2 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
