import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

/** Shared fill for all organic SVG paths — driven by `--organic-surface` on the button root. */
const fillOrganic = "fill-[var(--organic-surface)] transition-colors duration-200"

const organicButtonVariants = cva("flex flex-col transition-all duration-200", {
  variants: {
    variantColor: {
      primary:
        "text-[var(--organic-fg)] [--organic-fg:#ffffff] [--organic-surface:#2563eb] hover:[--organic-surface:#1d4ed8] active:[--organic-surface:#1e40af] [filter:drop-shadow(0_2px_4px_rgba(37,99,235,0.25))]",
      secondary:
        "text-[var(--organic-fg)] [--organic-fg:#0b1f44] [--organic-surface:#f8fafc] hover:[--organic-surface:#f1f5f9] active:[--organic-surface:#e2e8f0] [filter:drop-shadow(0_0_1px_rgba(11,31,68,0.28))_drop-shadow(0_1px_2px_rgba(11,31,68,0.06))]",
    },
    size: {
      sm: "h-9 min-h-9 [&_.organic-icon]:size-3.5 [&_.organic-label]:text-sm",
      md: "h-11 min-h-11 [&_.organic-icon]:size-4 [&_.organic-label]:text-base",
      lg: "h-14 min-h-14 [&_.organic-icon]:size-5 [&_.organic-label]:text-lg",
    },
    animationSpeed: {
      slow: "[--organic-duration:500ms]",
      normal: "[--organic-duration:400ms]",
      fast: "[--organic-duration:300ms]",
    },
  },
  defaultVariants: {
    size: "md",
    variantColor: "primary",
    animationSpeed: "normal",
  },
})

const svgShapeAttrs = {
  preserveAspectRatio: "xMidYMid meet",
}

function isExternalHref(href) {
  if (!href) return false
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  )
}

export const OrganicButton = forwardRef((
  {
    asChild,
    as,
    type,
    to,
    href,
    label,
    className,
    icon,
    size = "md",
    variantColor = "primary",
    animationSpeed = "normal",
    disabled = false,
    loading = false,
    loadingText,
    fullWidth = false,
    target,
    rel,
    onClick,
    ...props
  },
  ref
) => {
  const isActionDisabled = disabled || loading

  // Determine underlying component
  let Comp = "button"
  if (asChild) {
    Comp = Slot
  } else if (to) {
    Comp = Link
  } else if (href) {
    Comp = "a"
  } else if (type || as === "button") {
    Comp = "button"
  }

  const minWBySize = {
    sm: "min-w-[7.5rem]",
    md: "min-w-[8.5rem]",
    lg: "min-w-[10rem]",
  }
  const minW = fullWidth ? "w-full min-w-full" : minWBySize[size ?? "md"]

  const resolvedTarget = target ?? (isExternalHref(href) ? "_blank" : undefined)
  const resolvedRel = rel ?? (isExternalHref(href) ? "noopener noreferrer" : undefined)

  // Default icon or loading spinner
  const defaultIcon = (
    <ArrowUpRight className="organic-icon stroke-current transition-transform duration-200 group-hover/organic:rotate-45 group-hover/organic:scale-110" />
  )
  const displayIcon = loading ? (
    <span
      className="organic-icon size-4 inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  ) : icon !== undefined ? (
    icon
  ) : (
    defaultIcon
  )

  const displayLabel = loading ? (loadingText || label) : label

  // Component-specific attributes
  const compProps = {}
  if (Comp === "button") {
    compProps.type = type || "button"
    compProps.disabled = isActionDisabled
  } else if (Comp === Link) {
    compProps.to = to
  } else if (Comp === "a") {
    compProps.href = href
    compProps.target = resolvedTarget
    compProps.rel = resolvedRel
  }

  return (
    <div
      className={cn(
        fullWidth ? "w-full" : "w-fit",
        organicButtonVariants({
          variantColor,
          size,
          animationSpeed,
        }),
        isActionDisabled && "opacity-60 cursor-not-allowed pointer-events-none active:scale-100"
      )}
    >
      <Comp
        ref={ref}
        className={cn(
          "group/organic inline-flex h-full min-h-0 w-full min-w-0 max-w-full items-stretch",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "active:scale-[0.98] active:transition-transform transition-all duration-200 select-none",
          minW,
          className
        )}
        onClick={isActionDisabled ? (e) => e.preventDefault() : onClick}
        aria-busy={loading ? "true" : undefined}
        aria-disabled={isActionDisabled ? "true" : undefined}
        {...compProps}
        {...props}
      >
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row items-stretch">
          {/* Left pill section */}
          <div className="flex h-full min-h-0 min-w-0 flex-1 items-stretch">
            <RoundedFlatRight />

            <div
              className={cn(
                "flex h-full min-h-0 min-w-0 flex-1 items-center justify-start overflow-visible whitespace-nowrap bg-[var(--organic-surface)] transition-colors duration-200 pr-2 text-[var(--organic-fg)]"
              )}
            >
              <span className="flex items-center justify-start pl-2 transition-all duration-[var(--organic-duration,400ms)] ease-in-out">
                <span className="organic-label shrink-0 font-sans font-semibold leading-none">
                  {displayLabel}
                </span>
              </span>
            </div>

            <DescendingWall />
          </div>

          {/* Right pill section (icon) */}
          <div className="-ml-px flex h-full min-h-0 w-max shrink-0 items-stretch">
            <AscendingWall />

            <div
              className={cn(
                "flex h-full shrink-0 items-center justify-center overflow-visible whitespace-nowrap bg-[var(--organic-surface)] transition-colors duration-200 text-[var(--organic-fg)]"
              )}
            >
              <span className="flex items-center px-1.5 transition-all duration-[var(--organic-duration,400ms)] ease-in-out">
                {displayIcon}
              </span>
            </div>

            <FlatRoundedRight />
          </div>
        </div>
      </Comp>
    </div>
  )
})

OrganicButton.displayName = "OrganicButton"

function AscendingWall() {
  return (
    <svg
      aria-hidden="true"
      className="-mr-px h-full w-auto shrink-0 select-none pointer-events-none"
      fill="none"
      viewBox="0 0 18 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M7.101 40H18V0H16C13.594 0 11.4403 1.49249 10.5955 3.74532L0.546698 30.5421C-1.1694 35.1184 2.21356 40 7.101 40Z"
      />
    </svg>
  )
}

function FlatRoundedRight() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-px h-full w-auto shrink-0 select-none pointer-events-none"
      fill="none"
      viewBox="0 0 10 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M0 40V0H4C7.31371 0 10 2.68629 10 6V34C10 37.3137 7.31371 40 4 40H0Z"
      />
    </svg>
  )
}

function DescendingWall() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-px h-full w-auto shrink-0 select-none pointer-events-none"
      fill="none"
      viewBox="0 0 18 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M10.899 0H0V40H2C4.40603 40 6.55968 38.5075 7.4045 36.2547L17.4533 9.45786C19.1694 4.88161 15.7864 0 10.899 0Z"
      />
    </svg>
  )
}

function RoundedFlatRight() {
  return (
    <svg
      aria-hidden="true"
      className="-mr-px h-full w-auto shrink-0 select-none pointer-events-none"
      fill="none"
      viewBox="0 0 10 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M10 40V0H6C2.68629 0 0 2.68629 0 6V34C0 37.3137 2.68629 40 6 40H10Z"
      />
    </svg>
  )
}
