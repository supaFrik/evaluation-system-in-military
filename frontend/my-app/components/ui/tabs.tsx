"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center justify-center text-muted-foreground group-data-horizontal/tabs:flex-row group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "w-fit rounded-lg bg-muted p-[3px] group-data-horizontal/tabs:h-8",
        line: "w-full justify-start gap-6 bg-transparent border-b border-zinc-200 h-9 p-0 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-2 text-xs font-medium whitespace-nowrap transition-all cursor-pointer outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        // Default variant styles
        "group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-2.5 group-data-[variant=default]/tabs-list:py-1 group-data-[variant=default]/tabs-list:text-zinc-600 group-data-[variant=default]/tabs-list:hover:text-zinc-950 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-zinc-950 group-data-[variant=default]/tabs-list:data-active:shadow-xs",
        // Line variant styles (simple red line indicator)
        "group-data-[variant=line]/tabs-list:h-full group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:px-1 group-data-[variant=line]/tabs-list:pb-2 group-data-[variant=line]/tabs-list:pt-1 group-data-[variant=line]/tabs-list:text-zinc-500 group-data-[variant=line]/tabs-list:hover:text-zinc-900 group-data-[variant=line]/tabs-list:data-active:border-[#b91c1c] group-data-[variant=line]/tabs-list:data-active:text-[#b91c1c] group-data-[variant=line]/tabs-list:data-active:font-semibold -mb-px",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
